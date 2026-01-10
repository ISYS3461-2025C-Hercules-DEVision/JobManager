package com.job.manager.subscription.repository;

import com.job.manager.subscription.entity.Subscription;
import com.job.manager.subscription.entity.Subscription.SubscriptionStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends MongoRepository<Subscription, String> {
    
    Optional<Subscription> findByCompanyId(String companyId);
    
    List<Subscription> findByStatus(SubscriptionStatus status);
    
    List<Subscription> findByExpiryDateBefore(LocalDateTime date);
    
    List<Subscription> findByCompanyIdAndStatus(String companyId, SubscriptionStatus status);
}
