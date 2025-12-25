package com.job.manager.matching.config;

import com.job.manager.matching.dto.ApplicantCreatedEvent;
import com.job.manager.matching.dto.ApplicantMatchedEvent;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.*;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConfig {

    // CONSUMER: ApplicantCreatedEvent
    @Bean
    public ConsumerFactory<String, ApplicantCreatedEvent> applicantConsumerFactory() {

        // Configure JsonDeserializer to always use ApplicantCreatedEvent class
        JsonDeserializer<ApplicantCreatedEvent> deserializer =
                new JsonDeserializer<>(ApplicantCreatedEvent.class, false);
        deserializer.addTrustedPackages("com.job.manager.*");
        deserializer.setRemoveTypeHeaders(false);
        deserializer.setUseTypeMapperForKey(false);

        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:29092");
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "matching-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        // VALUE_DESERIALIZER is set via the deserializer instance below

        return new DefaultKafkaConsumerFactory<>(
                props,
                new StringDeserializer(),
                deserializer
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, ApplicantCreatedEvent>
    applicantKafkaListenerContainerFactory() {

        ConcurrentKafkaListenerContainerFactory<String, ApplicantCreatedEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(applicantConsumerFactory());
        return factory;
    }

    // PRODUCER: ApplicantMatchedEvent
    @Bean
    public ProducerFactory<String, ApplicantMatchedEvent> matchedProducerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:29092");
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    @Bean
    public KafkaTemplate<String, ApplicantMatchedEvent> matchedKafkaTemplate() {
        return new KafkaTemplate<>(matchedProducerFactory());
    }
}