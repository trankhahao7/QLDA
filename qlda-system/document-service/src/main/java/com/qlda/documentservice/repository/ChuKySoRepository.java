package com.qlda.documentservice.repository;

import com.qlda.documentservice.entity.ChuKySo;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChuKySoRepository extends JpaRepository<ChuKySo, Long> {

    Optional<ChuKySo> findFirstByVanBanIdOrderByNgayKyDesc(Long vanBanId);
}
