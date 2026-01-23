export function distributeStudyTime(plan, daysAvailable) {
  const dailyPlan = [];
  let dayIndex = 0;

  plan.forEach(item => {
    for (let i = 0; i < item.studyTimeHours; i++) {
      if (!dailyPlan[dayIndex]) dailyPlan[dayIndex] = [];
      dailyPlan[dayIndex].push(item.concept);
      dayIndex = (dayIndex + 1) % daysAvailable;
    }
  });

  return dailyPlan; // array of arrays: [[concepts for day1], [concepts for day2], ...]
}
