package com.sithumud.pos_backend.alert;

import com.sithumud.pos_backend.alert.entity.AnomalyAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AnomalyAlertRepository extends JpaRepository<AnomalyAlert, UUID>, JpaSpecificationExecutor<AnomalyAlert> {

    boolean existsByTitle(String title);
}
