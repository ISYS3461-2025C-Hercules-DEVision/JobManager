package com.job.manager.subscription.service;

import org.springframework.stereotype.Service;

@Service
public class SubscriptionService {

    // TODO: replace with real subscription lookup
    public boolean isPremiumActive(String companyId) {
        // For now, pretend all companies are premium.
        // Later, look up the subscription in MongoDB or another source.
        return true;
    }
}