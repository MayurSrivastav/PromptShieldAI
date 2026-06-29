package com.promptshield.repository;

import com.promptshield.model.Rule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RuleRepository extends JpaRepository<Rule, Long> {

    List<Rule> findByIsActiveTrue();
    Rule findByKeyword(String keyword);
    long countByIsActiveTrue();
}