package com.job.manager.subscription.repository;

import com.job.manager.subscription.entity.PaymentTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends MongoRepository<PaymentTransaction, String> {
    
    Optional<PaymentTransaction> findByStripeSessionId(String stripeSessionId);
    
    Optional<PaymentTransaction> findByStripePaymentIntentId(String stripePaymentIntentId);
    
    List<PaymentTransaction> findByCustomerId(String customerId);
    
    List<PaymentTransaction> findByCustomerIdAndSubsystem(String customerId, PaymentTransaction.Subsystem subsystem);
    
    List<PaymentTransaction> findByReferenceId(String referenceId);
    
    List<PaymentTransaction> findByStatus(PaymentTransaction.PaymentStatus status);
    
    List<PaymentTransaction> findBySubsystemAndStatus(PaymentTransaction.Subsystem subsystem, PaymentTransaction.PaymentStatus status);
}
