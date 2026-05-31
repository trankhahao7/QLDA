package com.qlda.workflowservice.scheduler;

import com.qlda.workflowservice.repository.UyQuyenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Component
public class DelegationExpiryScheduler {

    private static final Logger log = LoggerFactory.getLogger(DelegationExpiryScheduler.class);

    private final UyQuyenRepository uyQuyenRepository;

    public DelegationExpiryScheduler(UyQuyenRepository uyQuyenRepository) {
        this.uyQuyenRepository = uyQuyenRepository;
    }

    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void deactivateExpiredDelegations() {
        int count = uyQuyenRepository.deactivateExpired(LocalDate.now());
        if (count > 0) {
            log.info("Deactivated {} expired delegations", count);
        }
    }
}
