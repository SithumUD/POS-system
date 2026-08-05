package com.sithumud.pos_backend.setting;

import com.sithumud.pos_backend.setting.entity.StoreSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface StoreSettingRepository extends JpaRepository<StoreSetting, UUID> {
}
