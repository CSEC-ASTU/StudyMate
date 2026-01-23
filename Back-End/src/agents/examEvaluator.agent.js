/**
 * Evaluate student's exam answers
 * @param {Array} questions - exam questions with answers
 * @param {Array} studentAnswers - student's answers
 * @returns {Object} results and weak areas
 */
export function evaluateExam(questions, studentAnswers) {
  let score = 0;
  const weakAreas = [];

  questions.forEach((q, i) => {
    if (q.answer.toLowerCase() === studentAnswers[i]?.toLowerCase()) {
      score += 1;
    } else {
      weakAreas.push(q);
    }
  });

  const percentage = (score / questions.length) * 100;

  return {
    success: true,
    score,
    percentage,
    weakAreas
  };
}
