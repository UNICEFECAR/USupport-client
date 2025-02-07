import { getDBPool } from "#utils/dbConfig";

export const getAllAnsweredQuestionsQuery = async ({ poolCountry }) => {
  return await getDBPool("clinicalDb", poolCountry).query(
    `
        SELECT question.question, answer.title as answer_title, answer.text as answer_text, answer.provider_detail_id, answer.likes, answer.dislikes, array_agg(tags.tag) as tags
        FROM question
             JOIN answer on question.question_id = answer.question_id
             LEFT JOIN answer_tags_links on answer_tags_links.answer_id = answer.answer_id
             LEFT JOIN tags on answer_tags_links.tag_id = tags.tag_id
        GROUP BY question.question, answer.answer_id, question.created_at
        ORDER BY question.created_at DESC
    `
  );
};

export const createQuestionQuery = async ({
  poolCountry,
  question,
  clientDetailId,
}) => {
  return await getDBPool("clinicalDb", poolCountry).query(
    `
        INSERT INTO question (question, client_detail_id)
        VALUES ($1, $2)
        RETURNING question_id
    `,
    [question, clientDetailId]
  );
};

export const getClientQuestionsQuery = async ({
  poolCountry,
  clientDetailId,
  languageId,
}) => {
  return await getDBPool("clinicalDb", poolCountry).query(
    `
            SELECT 
                question.question, 
                question.created_at as question_created_at, 
                question.question_id as question_id,
                answer.answer_id as answer_id,
                answer.created_at as answer_created_at, 
                answer.title AS answer_title, 
                answer.text AS answer_text, 
                answer.provider_detail_id, 
                answer.likes, 
                answer.dislikes, 
                array_agg(tags.tag) AS tags
            FROM question
                LEFT JOIN answer on question.question_id = answer.question_id
                LEFT JOIN answer_tags_links on answer_tags_links.answer_id = answer.answer_id
                LEFT JOIN tags on answer_tags_links.tag_id = tags.tag_id
            WHERE question.client_detail_id = $1 AND question.status = 'active' AND ($2::uuid IS NULL OR answer.language_id = $2::uuid)
            GROUP BY 
                question.question, 
                question.question_id,
                answer.answer_id, 
                question.created_at, 
                question.client_detail_id
            ORDER BY answer.created_at DESC
        `,
    [clientDetailId, languageId === "all" ? null : languageId]
  );
};

export const getAllQuestionsQuery = async ({
  poolCountry,
  orderBy,
  languageId,
}) => {
  if (orderBy !== "most_popular")
    return await getDBPool("clinicalDb", poolCountry).query(
      `
        SELECT 
            question.client_detail_id,
            question.question, 
            question.created_at as question_created_at, 
            question.question_id as question_id,
            answer.answer_id as answer_id,
            answer.created_at as answer_created_at, 
            answer.title AS answer_title, 
            answer.text AS answer_text, 
            answer.provider_detail_id, 
            answer.likes, 
            answer.dislikes, 
            array_agg(tags.tag) AS tags
        FROM 
            question
            JOIN answer ON question.question_id = answer.question_id
            LEFT JOIN answer_tags_links ON answer_tags_links.answer_id = answer.answer_id
            LEFT JOIN tags ON answer_tags_links.tag_id = tags.tag_id
        WHERE question.status = 'active' AND (
        $2::uuid IS NULL OR answer.language_id = $2::uuid
        )
        GROUP BY 
            question.question, 
            question.question_id,
            answer.answer_id, 
            question.created_at, 
            question.client_detail_id
        ORDER BY
        CASE
          WHEN $1 = 'newest' THEN answer.created_at
          ELSE question.created_at
        END
        DESC
        `,
      [orderBy, languageId === "all" ? null : languageId]
    );
  return await getDBPool("clinicalDb", poolCountry).query(
    `
        SELECT 
            question.client_detail_id,
            question.question, 
            question.created_at as question_created_at, 
            question.question_id as question_id,
            answer.answer_id as answer_id,
            answer.created_at as answer_created_at, 
            answer.title AS answer_title, 
            answer.text AS answer_text, 
            answer.provider_detail_id, 
            answer.likes, 
            answer.dislikes, 
            array_agg(tags.tag) AS tags
        FROM 
            question
            JOIN answer ON question.question_id = answer.question_id
            LEFT JOIN answer_tags_links ON answer_tags_links.answer_id = answer.answer_id
            LEFT JOIN tags ON answer_tags_links.tag_id = tags.tag_id
        WHERE question.status = 'active'
        GROUP BY 
            question.question, 
            question.question_id,
            answer.answer_id, 
            question.created_at, 
            question.client_detail_id
        ORDER BY  cardinality(answer.likes) - cardinality(answer.dislikes) DESC
        `
  );
};

export const addAnswerVoteQuery = async ({
  poolCountry,
  client_detail_id,
  vote,
  answerId,
}) => {
  if (vote === "like") {
    return await getDBPool("clinicalDb", poolCountry).query(
      `
        UPDATE answer
        SET likes = (SELECT array_agg(distinct e) FROM UNNEST(likes || $1::VARCHAR) e),
            dislikes = array_remove(dislikes, $1::VARCHAR)
        WHERE answer_id = $2 AND NOT EXISTS (SELECT 1 FROM UNNEST(likes) e WHERE e = $1::VARCHAR)
        `,
      [client_detail_id, answerId]
    );
  } else if (vote === "dislike") {
    return await getDBPool("clinicalDb", poolCountry).query(
      `
    UPDATE answer
    SET dislikes = (SELECT array_agg(distinct e) FROM UNNEST(dislikes || $1::VARCHAR) e),
        likes = array_remove(likes, $1::VARCHAR)
    WHERE answer_id = $2 AND NOT EXISTS (SELECT 1 FROM UNNEST(dislikes) e WHERE e = $1::VARCHAR)
    `,
      [client_detail_id, answerId]
    );
  } else if (vote === "remove-like") {
    return await getDBPool("clinicalDb", poolCountry).query(
      `
      UPDATE answer
      SET likes = array_remove(likes, $1::VARCHAR)
      WHERE answer_id = $2
      `,
      [client_detail_id, answerId]
    );
  } else if (vote === "remove-dislike") {
    return await getDBPool("clinicalDb", poolCountry).query(
      `
      UPDATE answer
      SET dislikes = array_remove(dislikes, $1::VARCHAR)
      WHERE answer_id = $2
      `,
      [client_detail_id, answerId]
    );
  }
};
