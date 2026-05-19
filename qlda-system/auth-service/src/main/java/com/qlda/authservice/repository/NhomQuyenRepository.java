package com.qlda.authservice.repository;

import com.qlda.authservice.entity.NhomQuyen;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface NhomQuyenRepository extends JpaRepository<NhomQuyen, Integer>, JpaSpecificationExecutor<NhomQuyen> {

    Optional<NhomQuyen> findByMaNhomQuyen(String maNhomQuyen);

    boolean existsByMaNhomQuyen(String maNhomQuyen);
}
