package com.promptshield.repository;

import com.promptshield.model.ScanLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ScanLogRepository extends JpaRepository<ScanLog, Long> {

    // Count by action
    long countByAction(String action);

    // Find by action
    java.util.List<ScanLog> findByAction(String action);

    // Find by action ordered by date
    java.util.List<ScanLog> findAllByOrderByCreatedAtDesc();
}