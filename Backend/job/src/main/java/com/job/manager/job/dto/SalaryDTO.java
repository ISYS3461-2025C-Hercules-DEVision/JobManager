package com.job.manager.job.dto;

import com.job.manager.job.entity.Salary;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SalaryDTO {
    
    private Salary.SalaryType type;
    
    private Double min;
    
    private Double max;
    
    private Double value;
    
    private String prefix;
    
    private String currency;
    
    public static Salary toEntity(SalaryDTO dto) {
        if (dto == null) {
            return null;
        }
        return new Salary(
            dto.getType(),
            dto.getMin(),
            dto.getMax(),
            dto.getValue(),
            dto.getPrefix(),
            dto.getCurrency()
        );
    }
    
    public static SalaryDTO fromEntity(Salary salary) {
        if (salary == null) {
            return null;
        }
        return new SalaryDTO(
            salary.getType(),
            salary.getMin(),
            salary.getMax(),
            salary.getValue(),
            salary.getPrefix(),
            salary.getCurrency()
        );
    }
}
