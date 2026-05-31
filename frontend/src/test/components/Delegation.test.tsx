import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Delegation from '../../routes/user/Delegation';
import * as authApi from '../../services/auth/authApi';
import * as delegationApi from '../../services/workflows/delegationApi';

// ─── mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../services/auth/authApi', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('../../services/workflows/delegationApi', () => ({
  fetchDelegations: vi.fn(),
  createDelegation: vi.fn(),
  cancelDelegation: vi.fn(),
}));

const mockGetCurrentUser = vi.mocked(authApi.getCurrentUser);
const mockFetchDelegations = vi.mocked(delegationApi.fetchDelegations);
const mockCreateDelegation = vi.mocked(delegationApi.createDelegation);
const mockCancelDelegation = vi.mocked(delegationApi.cancelDelegation);

const currentUser = { id: 1001, username: 'admin', hoTen: 'Admin', email: 'admin@test.com' };

const makeDelegation = (overrides = {}) => ({
  id: 10,
  nguoiUyQuyenId: 1001,
  nguoiDuocUyQuyenId: 1002,
  tuNgay: '2026-06-01T00:00:00',
  denNgay: '2026-06-30T00:00:00',
  phamViUyQuyen: 'Ký duyệt công văn',
  active: true,
  ...overrides,
});

function pagedResponse(items: unknown[]) {
  return { data: { content: items, totalElements: items.length, totalPages: 1, number: 0, size: 50 } };
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function setup() {
  const user = userEvent.setup();
  const view = render(<Delegation />);
  return { user, ...view };
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe('Delegation page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(currentUser);
    mockFetchDelegations.mockResolvedValue(pagedResponse([]));
  });

  it('renders heading', async () => {
    setup();
    expect(await screen.findByText('Ủy quyền xử lý')).toBeInTheDocument();
  });

  it('shows empty state when no delegations', async () => {
    setup();
    expect(await screen.findByText('Chưa có ủy quyền nào')).toBeInTheDocument();
  });

  it('renders delegation rows', async () => {
    mockFetchDelegations.mockResolvedValue(pagedResponse([makeDelegation()]));
    setup();

    expect(await screen.findByText('Ký duyệt công văn')).toBeInTheDocument();
    expect(screen.getByText('Hiệu lực')).toBeInTheDocument();
  });

  it('shows inactive badge for expired delegation', async () => {
    mockFetchDelegations.mockResolvedValue(pagedResponse([makeDelegation({ active: false })]));
    setup();

    expect(await screen.findByText('Hết hạn / Đã hủy')).toBeInTheDocument();
  });

  it('opens create form when button clicked', async () => {
    const { user } = setup();
    await screen.findByText('Ủy quyền xử lý');

    const btn = screen.getByRole('button', { name: /\+ Tạo ủy quyền/i });
    await user.click(btn);

    expect(screen.getByRole('heading', { name: /Tạo ủy quyền mới/ })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nhập ID người dùng')).toBeInTheDocument();
  });

  it('closes form when Đóng form is clicked', async () => {
    const { user } = setup();
    await screen.findByText('Ủy quyền xử lý');

    await user.click(screen.getByRole('button', { name: /\+ Tạo ủy quyền/i }));
    expect(screen.getByRole('heading', { name: /Tạo ủy quyền mới/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Đóng form/i }));
    expect(screen.queryByRole('heading', { name: /Tạo ủy quyền mới/ })).not.toBeInTheDocument();
  });

  it('shows validation error when required fields empty', async () => {
    const { user } = setup();
    await screen.findByText('Ủy quyền xử lý');

    await user.click(screen.getByRole('button', { name: /\+ Tạo ủy quyền/i }));
    await user.click(screen.getByRole('button', { name: /^Tạo ủy quyền$/ }));

    expect(await screen.findByText(/Vui lòng điền đầy đủ/i)).toBeInTheDocument();
  });

  it('shows validation error when denNgay before tuNgay', async () => {
    const { user, container } = setup();
    await screen.findByText('Ủy quyền xử lý');
    await user.click(screen.getByRole('button', { name: /\+ Tạo ủy quyền/i }));

    await user.type(screen.getByPlaceholderText('Nhập ID người dùng'), '1002');
    const dateInputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2026-06-30' } });
    fireEvent.change(dateInputs[1], { target: { value: '2026-06-01' } });

    await user.click(screen.getByRole('button', { name: /^Tạo ủy quyền$/ }));

    expect(await screen.findByText(/Ngày kết thúc phải sau/i)).toBeInTheDocument();
  });

  it('calls createDelegation with correct payload on valid submit', async () => {
    mockCreateDelegation.mockResolvedValue(makeDelegation());
    mockFetchDelegations
      .mockResolvedValueOnce(pagedResponse([]))
      .mockResolvedValueOnce(pagedResponse([makeDelegation()]));

    const { user, container } = setup();
    await screen.findByText('Ủy quyền xử lý');
    await user.click(screen.getByRole('button', { name: /\+ Tạo ủy quyền/i }));

    await user.type(screen.getByPlaceholderText('Nhập ID người dùng'), '1002');
    const dateInputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2026-06-01' } });
    fireEvent.change(dateInputs[1], { target: { value: '2026-06-30' } });
    await user.type(screen.getByPlaceholderText(/VD: Ký duyệt/i), 'Ký duyệt công văn');

    await user.click(screen.getByRole('button', { name: /^Tạo ủy quyền$/ }));

    await waitFor(() => {
      expect(mockCreateDelegation).toHaveBeenCalledWith(
        expect.objectContaining({
          nguoiUyQuyenId: 1001,
          nguoiDuocUyQuyenId: 1002,
          tuNgay: '2026-06-01',
          denNgay: '2026-06-30',
        })
      );
    });
  });

  it('shows error when createDelegation fails', async () => {
    const { ApiError } = await import('../../services/core/apiClient');
    mockCreateDelegation.mockRejectedValue(new ApiError('Server error', 500));

    const { user, container } = setup();
    await screen.findByText('Ủy quyền xử lý');
    await user.click(screen.getByRole('button', { name: /\+ Tạo ủy quyền/i }));

    await user.type(screen.getByPlaceholderText('Nhập ID người dùng'), '1002');
    const dateInputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2026-06-01' } });
    fireEvent.change(dateInputs[1], { target: { value: '2026-06-30' } });

    await user.click(screen.getByRole('button', { name: /^Tạo ủy quyền$/ }));

    expect(await screen.findByText(/Server error|Tạo ủy quyền thất bại/i)).toBeInTheDocument();
  });

  it('calls cancelDelegation when Hủy button clicked', async () => {
    mockFetchDelegations.mockResolvedValue(pagedResponse([makeDelegation()]));
    mockCancelDelegation.mockResolvedValue({ id: 10 });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    setup();

    const cancelBtn = await screen.findByRole('button', { name: /Hủy/i });
    await userEvent.click(cancelBtn);

    await waitFor(() => {
      expect(mockCancelDelegation).toHaveBeenCalledWith(10);
    });
  });

  it('does not call cancelDelegation when confirm is dismissed', async () => {
    mockFetchDelegations.mockResolvedValue(pagedResponse([makeDelegation()]));
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    setup();

    const cancelBtn = await screen.findByRole('button', { name: /Hủy/i });
    await userEvent.click(cancelBtn);

    expect(mockCancelDelegation).not.toHaveBeenCalled();
  });

  it('shows error banner when getCurrentUser fails', async () => {
    const { ApiError } = await import('../../services/core/apiClient');
    mockGetCurrentUser.mockRejectedValue(new ApiError('Không thể tải dữ liệu ủy quyền', 500));

    setup();

    expect(await screen.findByText(/Không thể tải dữ liệu ủy quyền/i)).toBeInTheDocument();
  });
});
