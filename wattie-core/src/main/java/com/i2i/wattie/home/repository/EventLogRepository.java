package com.i2i.wattie.home.repository;

import com.i2i.wattie.home.entity.EventLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventLogRepository extends JpaRepository<EventLog, Long> {
}