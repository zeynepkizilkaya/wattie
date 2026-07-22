package com.i2i.wattie.home.repository;

import com.i2i.wattie.home.entity.EventLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EventLogRepository extends JpaRepository<EventLog, Long> {

    Optional<EventLog> findTopByHomeIdOrderByCreatedAtDesc(Long homeId);
}