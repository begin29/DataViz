# Data Viz Programming Exercise

## Files:

session_history.csv 	- Build history for a project over the course of several months, includes overall build times and status

Problems:

## 1. Charting app

Implement JS app that reads the session_history.csv file, and uses a JS charting library of your choice to present the following time-series:

   - passing and failing builds per day, stacked-chart
   - build time vs. time, line

## 2. Highlight Outliers

Extend the app from (1) to annotate days in the chart that have an "abnormal" number of failing builds.  Define (and justify) how you are determining "abnormal".

The input file is CSV formatted with one line per build ("session").  For example:

~~~
"session_id","started_by","created_at","summary_status","duration","worker_time","bundle_time","num_workers","branch","commit_id","started_tests_count","passed_tests_count","failed_tests_count","pending_tests_count","skipped_tests_count","error_tests_count"
"951155","wkj@tddium.com","2014-09-10 05:38:55 UTC","passed","605.0","10173.0","189","24","production","a82bfc7a1cf085bd72d99651cac5b6c563846581","0","311","0","3","0","0"
"950998","wkj@tddium.com","2014-09-10 02:07:17 UTC","passed","674.0","11645.0","197","24","production","b4ac608381bb216ff98366009bbee647eae948aa","0","311","0","3","0","0"
"950659","wkj@tddium.com","2014-09-09 23:29:39 UTC","error","0.0","0.0","0","0","production","a662b92fba90e0398a6c47b2db99307c1c60593b","0","0","0","0","0","314"
~~~

The interesting columns are:

    (3) - Build created_at
    (4) - Build final status
    (5) - Build overall duration, in seconds

## Solution:

Only copy this repository and open `index.html` file. Then open session_history.csv via index page.

### Ubnormal calculates
I have calculated `middle value` for all falls and found `abnormal falls` dates.
`Middle value` calculated by formula:

~~~
MV = (summ for all fails per each day)/(count of all fails day)
~~~
e.g. I have 10-01-2015 : 10 fails; 11-01-2015 : 3 fails;
MV = 13/2 ~ 8;

Then ubnormal here are values than fails count is more than `middle value`.
`10-01-2015` is ubnormal fails day for my example.