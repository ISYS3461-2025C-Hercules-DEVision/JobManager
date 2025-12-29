package com.job.manager.notification.config;

import com.job.manager.notification.dto.ApplicantMatchedEvent;
import com.job.manager.notification.dto.SubscriptionEventDTO;
import com.job.manager.notification.matching.dto.ApplicantCreatedEvent;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConfig {

    @Bean
    public ConsumerFactory<String, ApplicantMatchedEvent> matchedConsumerFactory() {
        JsonDeserializer<ApplicantMatchedEvent> deserializer =
                new JsonDeserializer<>(ApplicantMatchedEvent.class, false);
        deserializer.addTrustedPackages("com.job.manager.*");
        deserializer.setRemoveTypeHeaders(false);
        deserializer.setUseTypeMapperForKey(false);

        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:29092");
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "notification-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);

        return new DefaultKafkaConsumerFactory<>(
                props,
                new StringDeserializer(),
                deserializer
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, ApplicantMatchedEvent>
    matchedKafkaListenerContainerFactory() {

        ConcurrentKafkaListenerContainerFactory<String, ApplicantMatchedEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(matchedConsumerFactory());
        return factory;
    }

    @Bean
    public ConsumerFactory<String, ApplicantCreatedEvent> applicantProfileConsumerFactory() {
        JsonDeserializer<ApplicantCreatedEvent> deserializer =
                new JsonDeserializer<>(ApplicantCreatedEvent.class, false);
        deserializer.addTrustedPackages("com.job.manager.*");
        deserializer.setRemoveTypeHeaders(false);
        deserializer.setUseTypeMapperForKey(false);

        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:29092");
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "notification-matching-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);

        return new DefaultKafkaConsumerFactory<>(
                props,
                new StringDeserializer(),
                deserializer
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, ApplicantCreatedEvent>
    applicantProfileKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, ApplicantCreatedEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(applicantProfileConsumerFactory());
        return factory;
    }

        @Bean
        public ConsumerFactory<String, SubscriptionEventDTO> subscriptionConsumerFactory() {
                JsonDeserializer<SubscriptionEventDTO> deserializer =
                                new JsonDeserializer<>(SubscriptionEventDTO.class, false);
                deserializer.addTrustedPackages("com.job.manager.*");
                deserializer.setRemoveTypeHeaders(false);
                deserializer.setUseTypeMapperForKey(false);

                Map<String, Object> props = new HashMap<>();
                props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:29092");
                props.put(ConsumerConfig.GROUP_ID_CONFIG, "notification-group");
                props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);

                return new DefaultKafkaConsumerFactory<>(
                                props,
                                new StringDeserializer(),
                                deserializer
                );
        }

        @Bean
        public ConcurrentKafkaListenerContainerFactory<String, SubscriptionEventDTO>
        subscriptionKafkaListenerContainerFactory() {

                ConcurrentKafkaListenerContainerFactory<String, SubscriptionEventDTO> factory =
                                new ConcurrentKafkaListenerContainerFactory<>();
                factory.setConsumerFactory(subscriptionConsumerFactory());
                return factory;
        }
}