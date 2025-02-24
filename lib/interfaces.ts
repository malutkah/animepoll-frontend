
interface Question {
    id: string;
    survey_text: string;
    type: string;
    possible_answers: any;
}

interface Survey {
    id: string;
    title: string;
    description: string;
    genre_id?: string;
}

interface AggregatedTextResponse {
    answer_value: string;
    submitted_at: string;
}

interface AggregatedQuestionResult {
    question_id: string;
    question_text: string;
    type: string;
    response_count: number;
    options?: { option_text: string; count: number; percentage: number }[];
    average_rating?: number;
    distribution?: { [key: string]: number };
    // New optional field for text responses:
    responses?: AggregatedTextResponse[];
}

interface AggregatedSurveyResult {
    survey_id: string;
    title: string;
    description: string;
    total_responses: number;
    questions: AggregatedQuestionResult[];
}