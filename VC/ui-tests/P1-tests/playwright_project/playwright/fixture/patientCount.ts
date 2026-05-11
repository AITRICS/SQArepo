import { FullConfig } from '@playwright/test';
import { executeQuery } from './setDatabase.js';
import dotenv from 'dotenv'
dotenv.config();

export async function getScreenedCount() {
    const query = `
        SELECT 
            COUNT(*) AS all_count,
            CAST(SUM(CASE WHEN status = 'screened' THEN 1 ELSE 0 END) AS UNSIGNED) AS screened_count,
            CAST(SUM(CASE WHEN status = 'observing' THEN 1 ELSE 0 END) AS UNSIGNED) AS observing_count
        FROM (
            SELECT
                ee.status, 
                CAST(AES_DECRYPT(FROM_BASE64(as2.encrypted_patient_id), @secretkey, @iv) AS CHAR) AS patient_id 
            FROM
                vitalcare.emr_encounter ee 
            JOIN
                vitalcare.api_screeningrecord as2 ON ee.encrypted_emr_id = as2.encrypted_encounter_id 
            JOIN
                vitalcare.emr_patient ep ON ee.encrypted_patient_id = ep.encrypted_emr_id 
            WHERE
                ee.status IN ('screened', 'observing')
                AND CAST(AES_DECRYPT(FROM_BASE64(encrypted_birth_date), @secretkey, @iv) AS DATE) <= NOW() - INTERVAL 19 YEAR
                AND ee.discharge_dt IS NULL
                AND ep.death_dt IS NULL
                AND as2.screened_dt > NOW() - INTERVAL 24 HOUR
            GROUP BY 
                status, 
                patient_id
        ) AS subquery;
        `;
    const rows = await executeQuery(query);
    return rows;
};

export async function getReviewedCount() {
    const query = `
        SELECT 
            COUNT(*) AS all_count,
            CAST(SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS UNSIGNED) AS done_count,
            CAST(SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) AS UNSIGNED) AS error_count
        FROM (
            SELECT
                ee.status, 
                CAST(AES_DECRYPT(FROM_BASE64(as2.encrypted_patient_id), @secretkey, @iv) AS CHAR) AS patient_id 
            FROM
                vitalcare.emr_encounter ee 
            JOIN
                vitalcare.api_screeningrecord as2 ON ee.encrypted_emr_id = as2.encrypted_encounter_id 
            JOIN
                vitalcare.emr_patient ep ON ee.encrypted_patient_id = ep.encrypted_emr_id 
            WHERE
                ee.status IN ('done', 'error')
                AND CAST(AES_DECRYPT(FROM_BASE64(encrypted_birth_date), @secretkey, @iv) AS DATE) <= NOW() - INTERVAL 19 YEAR
                AND ee.discharge_dt IS NULL
                AND ep.death_dt IS NULL
            GROUP BY 
                status, 
                patient_id
        ) AS subquery;
        `;
    const rows = await executeQuery(query);
    return rows;
};

export async function getAllPatientsCount() {
    const query = `
        SELECT
          COUNT(*) AS all_count,
          CAST(SUM(CASE WHEN status = 'NO_STATUS'  THEN 1 ELSE 0 END) AS UNSIGNED) AS no_status_count,
          CAST(SUM(CASE WHEN status = 'screened'   THEN 1 ELSE 0 END) AS UNSIGNED) AS screened_count,
          CAST(SUM(CASE WHEN status = 'observing'  THEN 1 ELSE 0 END) AS UNSIGNED) AS observing_count,
          CAST(SUM(CASE WHEN status = 'done'       THEN 1 ELSE 0 END) AS UNSIGNED) AS done_count,
          CAST(SUM(CASE WHEN status = 'error'      THEN 1 ELSE 0 END) AS UNSIGNED) AS error_count,
          CAST(SUM(CASE WHEN status = 'dismissed'  THEN 1 ELSE 0 END) AS UNSIGNED) AS dismissed_count
        FROM (
          SELECT
            ee.status,
            CAST(
              AES_DECRYPT(
                FROM_BASE64(ee.encrypted_patient_id),
                @secretkey,
                @iv
              ) AS CHAR
            ) AS patient_id
          FROM emr_encounter ee
          LEFT JOIN api_screeningrecord as2
            ON ee.encrypted_emr_id = as2.encrypted_encounter_id
          JOIN emr_patient ep
            ON ee.encrypted_patient_id = ep.encrypted_emr_id
          WHERE
            ee.status IN ('NO_STATUS', 'screened', 'observing', 'error', 'done', 'dismissed')
            AND CAST(
                  AES_DECRYPT(
                    FROM_BASE64(ep.encrypted_birth_date),
                    @secretkey,
                    @iv
                  ) AS DATE
                ) <= NOW() - INTERVAL 19 YEAR
            AND ee.discharge_dt IS NULL
            AND ep.death_dt IS NULL
          GROUP BY
            ee.status,
            patient_id
        ) AS patient_list;
    `;
    const rows = await executeQuery(query);
    return rows;
};

export async function getDismissedCount() {
    const query = `
        SELECT COUNT(*) AS row_count
            FROM (
                SELECT
                    ee.status, 
                    CAST(AES_DECRYPT(FROM_BASE64(as2.encrypted_patient_id), @secretkey, @iv) AS CHAR) AS patient_id 
                FROM
                    vitalcare.emr_encounter ee 
                JOIN
                    vitalcare.api_screeningrecord as2 ON ee.encrypted_emr_id = as2.encrypted_encounter_id 
                JOIN
                    vitalcare.emr_patient ep ON ee.encrypted_patient_id = ep.encrypted_emr_id 
                WHERE
                    ee.status IN ('dismissed')
                    AND CAST(AES_DECRYPT(FROM_BASE64(encrypted_birth_date), @secretkey, @iv) AS DATE) <= NOW() - INTERVAL 19 YEAR
                    AND ee.discharge_dt IS NULL
                    AND ep.death_dt IS NULL
                GROUP BY 
                    status, 
                    patient_id
        ) AS subquery;
        `;
    const rows = await executeQuery(query);
    return rows;
};
