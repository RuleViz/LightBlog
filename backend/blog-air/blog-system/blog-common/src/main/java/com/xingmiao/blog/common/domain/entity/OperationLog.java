package com.xingmiao.blog.common.domain.entity;

import com.xingmiao.blog.common.domain.enums.OperationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "operation_logs",
       indexes = {
               @Index(name = "idx_operation_type", columnList = "operation_type"),
               @Index(name = "idx_resource", columnList = "resource_type,resource_id"),
               @Index(name = "idx_status", columnList = "status"),
               @Index(name = "idx_created_at", columnList = "created_at")
       })
public class OperationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "operation_type", length = 50, nullable = false)
    private String operationType;

    @Column(name = "operation_desc", columnDefinition = "text")
    private String operationDesc;

    @Column(name = "resource_type", length = 50)
    private String resourceType;

    @Column(name = "resource_id")
    private Long resourceId;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "text")
    private String userAgent;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private OperationStatus status;

    @Column(name = "error_message", columnDefinition = "text")
    private String errorMessage;

    @Column(name = "execution_time")
    private Long executionTime;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}


