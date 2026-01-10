package com.job.manager.job.enums;

/**
 * Employment types for job posts
 */
public enum EmploymentType {
    FULL_TIME("Full-time"),
    PART_TIME("Part-time"),
    INTERNSHIP("Internship"),
    CONTRACT("Contract");

    private final String displayName;

    EmploymentType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static EmploymentType fromString(String text) {
        for (EmploymentType type : EmploymentType.values()) {
            if (type.displayName.equalsIgnoreCase(text) || type.name().equalsIgnoreCase(text)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown employment type: " + text);
    }
}
