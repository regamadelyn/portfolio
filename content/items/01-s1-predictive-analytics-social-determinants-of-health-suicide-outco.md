---
id: S1
order: 1
tier: Featured  # Featured | Core | Supporting
title: "Predictive Analytics: Social Determinants of Health & Suicide Outcomes"
short_label: "SDOH & suicide prediction"
slug: "predictive-analytics-social-determinants-of-health-suicide-outco"
setting: School  # Work | School | Volunteer
group: "School"
subgroup: "Research & projects"
type: "Research project"
organization: "DH 5160 Analytics and AI for Health Strategies, Iowa State University"
role: "Graduate Researcher"
dates: "Fall 2025"
summary: "Built count-regression models on public CDC and Census data to show how poverty, race, sex, age and disability interact in suicide deaths across 10 Southeastern states."
topics: ["Health equity & SDOH", "Behavioral & mental health", "Applied AI"]
methods: ["Quantitative methods & modeling", "Data science & visualization", "Qualitative methods"]
tools: ["Programming (Python, R, SQL)"]
strengths: ["Systems thinking", "Ethics & critical thinking"]
metrics: ["10 states", "3 public datasets", "IRR 1.121 (p < .001)", "ΔAIC ≈ −103,000"]
media: []
internal_notes: ""  # never rendered; private notes are in NOTES-private.md (git-ignored)
---

## Question
How do socioeconomic and demographic factors (poverty, race, sex, age group, disability) interact to influence suicide deaths across 10 Southeastern U.S. states?

## Methods
Merged and cleaned three public datasets (CDC WONDER mortality, CDC Disability and Health Data System, Census SAIPE poverty) by state and year in Python (pandas) and R (tidyverse). Began with OLS regression (R² = 0.679) and diagnosed severe multicollinearity; moved to Poisson, found overdispersion (deviance/df = 2.62), and fit a negative binomial model (MASS glm.nb) with a population offset and three interaction terms. Designed a Tableau dashboard (choropleth, scatter, bar) for state public-health officials. Ran in parallel with an ethnographic study (S6), whose findings added the poverty dataset.

## Findings
The interaction model improved fit by about 103,000 AIC points over the main-effects model. Age × sex and race × poverty interactions were highly significant (p < .001): for White residents, each 1 SD rise in state poverty was associated with a 12.1% higher suicide death rate (IRR = 1.121). Disability × poverty was not significant (IRR = 0.9998).
