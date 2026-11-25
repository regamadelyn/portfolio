---
id: S10
order: 18
tier: Core  # Featured | Core | Supporting
title: "NHANES Data Wrangling & Exploratory Analysis: Sedentary Time and BMI"
short_label: "NHANES analysis"
slug: "nhanes-data-wrangling-exploratory-analysis-sedentary-time-and-bm"
setting: School  # Work | School | Volunteer
group: "School"
subgroup: "Research & projects"
type: "Analysis exercise"
organization: "DH 5160 Analytics and AI for Health Strategies, Iowa State University"
role: "Student"
dates: "Fall 2025"
summary: "Pulled CDC NHANES 2017–18 survey data into Python, merged and cleaned it, engineered new variables, and explored how sedentary time relates to BMI."
topics: ["Health equity & SDOH"]
methods: ["Data science & visualization", "Quantitative methods & modeling"]
tools: ["Programming (Python, R, SQL)"]
strengths: ["Systems thinking"]
metrics: ["3 CDC datasets merged", "4 engineered variables", "mean sedentary time 358 min/day"]
media:
  - src: "/assets/img/projects/nhanes-bmi-by-sedentary-level.png"
    caption: "BMI distribution by daily sedentary level, NHANES 2017–18 (descriptive)."
    fit: contain
internal_notes: ""  # never rendered; private notes are in NOTES-private.md (git-ignored)
---

## Question
How does daily sedentary time relate to body mass index among U.S. survey participants?

## Methods
Downloaded three NHANES 2017–18 files from the CDC (demographics, physical activity, body measures) and loaded the SAS transport files with pandas; merged on participant ID; selected and renamed variables, checked missingness and dropped incomplete records; recoded gender; engineered age groups, a four-level sedentary-time variable (from PAD680), activity levels and CDC BMI categories with pd.cut; computed grouped means and NumPy summary statistics; and visualized distributions with Matplotlib and Seaborn box plots and histograms.

## Findings
Mean sedentary time was 358 minutes a day (median 300). Box plots showed median BMI rising slightly from the low to the very-high sedentary group, suggesting a positive association between sedentary time and BMI (descriptive only, not tested statistically).
