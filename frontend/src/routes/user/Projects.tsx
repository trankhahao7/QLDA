interface ProjectItem {
  name: string;
  owner: string;
  progress: string;
}

export default function Projects() {
  const projects: ProjectItem[] = [
    {
      name: "Dự án Trung tâm hành chính",
      owner: "Ban QLDA 1",
      progress: "65%",
    },
    {
      name: "Dự án hạ tầng giao thông",
      owner: "Ban QLDA 2",
      progress: "42%",
    },
    {
      name: "Dự án số hóa hồ sơ",
      owner: "Phòng CNTT",
      progress: "80%",
    },
  ];

  return (
    <section>
      <div className="topbar">
        <div className="topbar__title">
          <h1>Quản lý dự án</h1>
          <p>Danh sách dự án đang theo dõi và văn bản liên quan.</p>
        </div>
        <div className="topbar__actions">
          <button className="button" type="button">
            Tạo dự án
          </button>
        </div>
      </div>

      <div className="grid-3">
        {projects.map((project) => (
          <div className="card" key={project.name}>
            <h3>{project.name}</h3>
            <p>Phụ trách: {project.owner}</p>
            <span className="badge">Tiến độ {project.progress}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
