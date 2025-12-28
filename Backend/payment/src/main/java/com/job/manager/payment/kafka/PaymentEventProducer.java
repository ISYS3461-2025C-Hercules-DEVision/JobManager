package com.job.manager.payment.kafka;

import com.job.manager.payment.dto.PaymentEventDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentEventProducer {

    private final KafkaTemplate<String, PaymentEventDTO> kafkaTemplate;

    @Value("${kafka.topics.payment-initiated}")
    private String paymentInitiatedTopic;

    @Value("${kafka.topics.payment-success}")
    private String paymentSuccessTopic;

    @Value("${kafka.topics.payment-failed}")
    private String paymentFailedTopic;

    public void sendPaymentInitiatedEvent(PaymentEventDTO event) {
        log.info("Sending payment initiated event: {}", event);
        kafkaTemplate.send(paymentInitiatedTopic, event.getCustomerId(), event);
    }

    public void sendPaymentSuccessEvent(PaymentEventDTO event) {
        log.info("Sending payment success event: {}", event);
        kafkaTemplate.send(paymentSuccessTopic, event.getCustomerId(), event);
    }

    public void sendPaymentFailedEvent(PaymentEventDTO event) {
        log.info("Sending payment failed event: {}", event);
        kafkaTemplate.send(paymentFailedTopic, event.getCustomerId(), event);
    }
}
