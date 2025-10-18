package com.xingmiao.blog.common.domain.entity;

import com.xingmiao.blog.common.domain.enums.ConfigType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "system_configs",
       uniqueConstraints = {
               @UniqueConstraint(name = "uk_system_configs_config_key", columnNames = {"config_key"})
       })
public class SystemConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "config_key", nullable = false, length = 100)
    private String configKey;

    @Column(name = "config_value", columnDefinition = "text")
    private String configValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "config_type", length = 20, nullable = false)
    private ConfigType configType;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}


