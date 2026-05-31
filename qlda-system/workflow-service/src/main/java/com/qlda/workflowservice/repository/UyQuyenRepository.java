package com.qlda.workflowservice.repository;

import com.qlda.workflowservice.entity.UyQuyen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface UyQuyenRepository extends JpaRepository<UyQuyen, Long> {
    List<UyQuyen> findByNguoiUyQuyenIdOrNguoiDuocUyQuyenId(Long nguoiUyQuyenId, Long nguoiDuocUyQuyenId);

    @Modifying
    @Query("UPDATE UyQuyen u SET u.active = false WHERE u.active = true AND u.denNgay < :today")
    int deactivateExpired(LocalDate today);
}
