package com.job.manager.payment.repository;

import com.job.manager.payment.entity.PaymentTransaction;
import com.job.manager.payment.entity.PaymentTransaction.PaymentStatus;
import com.job.manager.payment.entity.PaymentTransaction.Subsystem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends MongoRepository<PaymentTransaction, String> {
    
    Optional<PaymentTransaction> findByStripeSessionId(String stripeSessionId);
    
    Optional<PaymentTransaction> findByStripePaymentIntentId(String stripePaymentIntentId);
    
    List<PaymentTransaction> findByCustomerId(String customerId);
    
    List<PaymentTransaction> findByCustomerIdAndSubsystem(String customerId, Subsystem subsystem);
    
    List<PaymentTransaction> findByReferenceId(String referenceId);
    
    List<PaymentTransaction> findByStatus(PaymentStatus status);
    
    List<PaymentTransaction> findBySubsystemAndStatus(Subsystem subsystem, PaymentStatus status);
}
