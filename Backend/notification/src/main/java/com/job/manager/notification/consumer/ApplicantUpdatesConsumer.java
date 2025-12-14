package com.job.manager.notification.consumer;

import org.springframework.stereotype.Service;

@Service
public class ApplicantUpdatesConsumer {

    //Todo: Consume applicant update event and notify company
//    @KafkaListener(topics = "${kafka.topic.applicant-profile-updates}", groupId = "authentication-consumer-group")
//    public void consume(ApplicantUpdateDto applicantUpdateDto) {
//        System.out.println("Received applicant update event: " + jobUpdatesDto);
//        // Process the applicant update event (e.g., send notification to applicants)
//    }

}
