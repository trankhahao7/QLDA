package com.qlda.workflowservice.repository;

import com.qlda.workflowservice.entity.UyQuyen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UyQuyenRepository extends JpaRepository<UyQuyen, Long> {
    List<UyQuyen> findByNguoiUyQuyenIdOrNguoiDuocUyQuyenId(Long nguoiUyQuyenId, Long nguoiDuocUyQuyenId);
}
