import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";

// ─── EMBEDDED DATA (mirrors Google Sheets structure) ────────────────────────
// In production this would be fetched from Google Sheets CSV export
const RAW_DATA = {
  dashboard_config: [
    { source_period: "До мая 2026", key: "period_start", value: "2026-02-07", type: "date" },
    { source_period: "До мая 2026", key: "period_end", value: "2026-04-01", type: "date" },
    { source_period: "До мая 2026", key: "total_responses", value: 188 },
    { source_period: "До мая 2026", key: "valid_q4_forced_choice", value: 159 },
    { source_period: "До мая 2026", key: "valid_recommendation_classified", value: 175 },
    { source_period: "До мая 2026", key: "recommendation_score", value: 44.6 },
    { source_period: "До мая 2026", key: "promoters_pct", value: 0.64 },
    { source_period: "До мая 2026", key: "neutrals_pct", value: 0.1657 },
    { source_period: "До мая 2026", key: "critics_pct", value: 0.1943 },
    { source_period: "До мая 2026", metric: "promoters", value: 112 },
    { source_period: "До мая 2026", metric: "neutrals", value: 29 },
    { source_period: "До мая 2026", metric: "critics", value: 34 },
    { source_period: "Май 2026 + 1 июня", metric: "period", value: "Май 2026 + 1 июня" },
    { source_period: "Май 2026 + 1 июня", metric: "period_start", value: "2026-05-01" },
    { source_period: "Май 2026 + 1 июня", metric: "period_end", value: "2026-06-01" },
    { source_period: "Май 2026 + 1 июня", metric: "actual_first_response", value: "2026-05-09" },
    { source_period: "Май 2026 + 1 июня", metric: "actual_last_response", value: "2026-06-01" },
    { source_period: "Май 2026 + 1 июня", metric: "total_responses", value: 83 },
    { source_period: "Май 2026 + 1 июня", metric: "valid_q4_forced", value: 72 },
    { source_period: "Май 2026 + 1 июня", metric: "valid_recommendation_classified", value: 75 },
    { source_period: "Май 2026 + 1 июня", metric: "recommendation_score", value: 57 },
    { source_period: "Май 2026 + 1 июня", metric: "promoters_count", value: 54 },
    { source_period: "Май 2026 + 1 июня", metric: "promoters_pct", value: 72 },
    { source_period: "Май 2026 + 1 июня", metric: "neutrals_count", value: 10 },
    { source_period: "Май 2026 + 1 июня", metric: "neutrals_pct", value: 13.3 },
    { source_period: "Май 2026 + 1 июня", metric: "critics_count", value: 11 },
    { source_period: "Май 2026 + 1 июня", metric: "critics_pct", value: 14.7 },
    { source_period: "Май 2026 + 1 июня", metric: "no_answer_recommendation", value: 8 },
  ],
  theme_summary: [
    // До мая 2026
    { source_period: "До мая 2026", tag: "DELIVERY_TIME", theme: "Таймеры, опоздания и рейтинг", mentions: 94, respondent_count: 70, share: 37.2, priority: "P0", responsibility: "Product / Ops", description: "Новички сталкиваются с нехваткой времени и риском просрочки, что влияет на рейтинг, доход и ощущение справедливости.", hypothesis: "Grace period для новичков / заказы с запасом времени / отдельная логика рейтинга в первые смены" },
    { source_period: "До мая 2026", tag: "ONBOARDING", theme: "Онбординг и первые объяснения", mentions: 59, respondent_count: 54, share: 28.7, priority: "P0", responsibility: "Product / Ops", description: "Новичку не хватает структурированного ввода в работу.", hypothesis: "Чек-лист первого дня + памятка новичка + сценарные подсказки в приложении" },
    { source_period: "До мая 2026", tag: "SUPPORT_CURATOR", theme: "Куратор, наставник и поддержка", mentions: 112, respondent_count: 90, share: 47.9, priority: "P0/P1", responsibility: "Ops / HR / Product", description: "Куратор и коллеги могут как сильно улучшить старт, так и стать точкой отказа.", hypothesis: "Стандарт работы куратора с новичком и контроль первого контакта" },
    { source_period: "До мая 2026", tag: "ORDER_QUEUE", theme: "Очередь и распределение заказов", mentions: 61, respondent_count: 46, share: 24.5, priority: "P1 / hidden P0", responsibility: "Ops / Product", description: "Новички воспринимают распределение заказов как несправедливое.", hypothesis: "Мягкий приоритет первых заказов для новичков" },
    { source_period: "До мая 2026", tag: "ROUTE_LOGISTICS", theme: "Маршруты, район и навигация", mentions: 86, respondent_count: 64, share: 34.0, priority: "P1", responsibility: "Product / Ops", description: "Новичок не знает район и порядок доставки, из-за чего теряет время.", hypothesis: "Рекомендованный порядок доставки + визуальное деление района на зоны" },
    { source_period: "До мая 2026", tag: "PAY_MOTIVATION", theme: "Оплата, ставки и мотивация", mentions: 92, respondent_count: 68, share: 36.2, priority: "Out / P1", responsibility: "C&B / Ops", description: "Низкая воспринимаемая оплата снижает мотивацию.", hypothesis: "Прозрачность начислений + доплаты за сложность / дальность / плохую погоду" },
    { source_period: "До мая 2026", tag: "EQUIPMENT", theme: "Велосипеды, форма, термосумки", mentions: 38, respondent_count: 32, share: 17.0, priority: "P2", responsibility: "Supply / Ops", description: "Отсутствие или задержка выдачи оборудования блокирует старт.", hypothesis: "Статус выдачи / бронь велосипеда / комплект новичка" },
    { source_period: "До мая 2026", tag: "POSITIVE_EXPERIENCE", theme: "Позитивный опыт старта", mentions: 108, respondent_count: 90, share: 57.4, priority: "Positive", responsibility: "Product / Ops" },
    { source_period: "До мая 2026", tag: "APP_UX", theme: "Приложение и интерфейс", mentions: 28, respondent_count: 24, share: 12.8, priority: "P1", responsibility: "Product" },
    { source_period: "До мая 2026", tag: "PHYSICAL_CONDITIONS", theme: "Физические условия: погода, парковки", mentions: 22, respondent_count: 18, share: 9.6, priority: "P2", responsibility: "Ops" },
    { source_period: "До мая 2026", tag: "PACKAGING_PICKING", theme: "Сборка, пакеты, полки, поиск заказов", mentions: 29, respondent_count: 22, share: 15.4, priority: "P1/P2", responsibility: "Ops / Product edge" },
    { source_period: "До мая 2026", tag: "CUSTOMER_COMMUNICATION", theme: "Общение с клиентом", mentions: 18, respondent_count: 14, share: 7.4, priority: "P2", responsibility: "Product" },
    // Май 2026
    { source_period: "Май 2026 + 1 июня", tag: "POSITIVE_EXPERIENCE", theme: "Позитивный опыт старта", mentions: 42, respondent_count: 35, share: 50.6, priority: "Positive", responsibility: "Product / Ops", prev_mentions: 108, prev_share: 57.4, share_delta_pp: -6.8, trend: "ослабло" },
    { source_period: "Май 2026 + 1 июня", tag: "NO_PROBLEM", theme: "Нет явной проблемы / всё нормально", mentions: 40, respondent_count: 34, share: 48.2, priority: "Positive / Control", prev_mentions: 32, prev_share: 17.0, share_delta_pp: 31.2, trend: "усилилось" },
    { source_period: "Май 2026 + 1 июня", tag: "PAY_MOTIVATION", theme: "Оплата, ставки, деньги, бонусы", mentions: 37, respondent_count: 30, share: 44.6, priority: "Out / P1", responsibility: "C&B / Ops", prev_mentions: 92, prev_share: 48.9, share_delta_pp: -4.3, trend: "стабильно / без резкого изменения", hypothesis: "Прозрачность начислений, доплаты за сложность/дальность/погодные условия." },
    { source_period: "Май 2026 + 1 июня", tag: "ROUTE_LOGISTICS", theme: "Маршруты, район и навигация", mentions: 32, respondent_count: 26, share: 38.6, priority: "P1", responsibility: "Product / Ops", prev_mentions: 86, prev_share: 34.0, share_delta_pp: 4.6, trend: "усилилось" },
    { source_period: "Май 2026 + 1 июня", tag: "SUPPORT_CURATOR", theme: "Куратор, наставник и поддержка", mentions: 28, respondent_count: 22, share: 33.7, priority: "P0/P1", responsibility: "Ops / HR / Product", prev_mentions: 112, prev_share: 47.9, share_delta_pp: -14.2, trend: "ослабло", hypothesis: "Стандарт работы куратора с новичком и контроль первого контакта" },
    { source_period: "Май 2026 + 1 июня", tag: "DELIVERY_TIME", theme: "Таймеры, опоздания и рейтинг", mentions: 24, respondent_count: 20, share: 28.9, priority: "P0", responsibility: "Product / Ops", prev_mentions: 94, prev_share: 37.2, share_delta_pp: -7.3, trend: "ослабло", hypothesis: "Grace period для новичков / отдельная логика рейтинга в первые смены" },
    { source_period: "Май 2026 + 1 июня", tag: "ONBOARDING", theme: "Онбординг и первые объяснения", mentions: 23, respondent_count: 19, share: 27.7, priority: "P0", responsibility: "Product / Ops", prev_mentions: 59, prev_share: 28.7, share_delta_pp: -12.7, trend: "ослабло", hypothesis: "Чек-лист первого дня + памятка новичка + сценарные подсказки в приложении" },
    { source_period: "Май 2026 + 1 июня", tag: "APP_UX", theme: "Приложение и интерфейс", mentions: 12, respondent_count: 10, share: 14.5, priority: "P1", responsibility: "Product", prev_mentions: 28, prev_share: 12.8, share_delta_pp: 1.7, trend: "стабильно" },
    { source_period: "Май 2026 + 1 июня", tag: "PHYSICAL_CONDITIONS", theme: "Физические условия: погода, парковки", mentions: 10, respondent_count: 8, share: 12.0, priority: "P2", responsibility: "Ops" },
    { source_period: "Май 2026 + 1 июня", tag: "ORDER_QUEUE", theme: "Очередь и распределение заказов", mentions: 9, respondent_count: 8, share: 10.8, priority: "P1 / hidden P0", responsibility: "Ops / Product" },
    { source_period: "Май 2026 + 1 июня", tag: "CUSTOMER_COMMUNICATION", theme: "Общение с клиентом", mentions: 7, respondent_count: 6, share: 8.4, priority: "P2" },
    { source_period: "Май 2026 + 1 июня", tag: "EQUIPMENT", theme: "Велосипеды, форма, термосумки", mentions: 6, respondent_count: 5, share: 7.2, priority: "P2 / Ops" },
    { source_period: "Май 2026 + 1 июня", tag: "PACKAGING_PICKING", theme: "Сборка, пакеты, полки, поиск заказов", mentions: 8, respondent_count: 7, share: 9.6, priority: "P1/P2", prev_mentions: 29, prev_share: 15.4, share_delta_pp: -5.8, trend: "ослабло" },
  ],
  forced_choice: [
    { source_period: "До мая 2026", rank: 1, tag: "NO_PROBLEM", theme: "Нет явной проблемы", mentions: 30, share_pct: 0.1887, priority: "Control" },
    { source_period: "До мая 2026", rank: 2, tag: "OTHER", theme: "Другое / ручная кодировка", mentions: 25, share_pct: 0.1572, priority: "Manual check" },
    { source_period: "До мая 2026", rank: 3, tag: "PAY_MOTIVATION", theme: "Оплата, ставки и мотивация", mentions: 24, share_pct: 0.1509, priority: "Out / P1" },
    { source_period: "До мая 2026", rank: 4, tag: "ONBOARDING", theme: "Онбординг и первые объяснения", mentions: 18, share_pct: 0.1132, priority: "P0" },
    { source_period: "До мая 2026", rank: 5, tag: "SUPPORT_CURATOR", theme: "Куратор, наставник и поддержка", mentions: 16, share_pct: 0.1006, priority: "P0/P1" },
    { source_period: "До мая 2026", rank: 6, tag: "DELIVERY_TIME", theme: "Таймеры, опоздания и рейтинг", mentions: 13, share_pct: 0.0818, priority: "P0" },
    { source_period: "До мая 2026", rank: 7, tag: "ROUTE_LOGISTICS", theme: "Маршруты, район и навигация", mentions: 7, share_pct: 0.044, priority: "P1" },
    { source_period: "До мая 2026", rank: 8, tag: "ORDER_QUEUE", theme: "Очередь и распределение заказов", mentions: 11, share_pct: 0.0692, priority: "P1 / hidden P0" },
    { source_period: "До мая 2026", rank: 9, tag: "EQUIPMENT", theme: "Велосипеды, форма, термосумки", mentions: 8, share_pct: 0.0503, priority: "P2" },
    { source_period: "До мая 2026", rank: 10, tag: "APP_UX", theme: "Приложение и интерфейс", mentions: 7, share_pct: 0.044, priority: "P1" },
    // Май 2026
    { source_period: "Май 2026 + 1 июня", rank: 1, tag: "NO_PROBLEM", theme: "Нет явной проблемы", mentions: 16, share_pct: 0.222, priority: "Positive / Control" },
    { source_period: "Май 2026 + 1 июня", rank: 2, tag: "PAY_MOTIVATION", theme: "Оплата, ставки и мотивация", mentions: 12, share_pct: 0.167, priority: "Out / P1" },
    { source_period: "Май 2026 + 1 июня", rank: 3, tag: "OTHER", theme: "Другое / ручная кодировка", mentions: 10, share_pct: 0.139, priority: "Manual check" },
    { source_period: "Май 2026 + 1 июня", rank: 4, tag: "ONBOARDING", theme: "Онбординг и первые объяснения", mentions: 7, share_pct: 0.097, priority: "P0" },
    { source_period: "Май 2026 + 1 июня", rank: 5, tag: "SUPPORT_CURATOR", theme: "Куратор, наставник и поддержка", mentions: 5, share_pct: 0.069, priority: "P0/P1" },
    { source_period: "Май 2026 + 1 июня", rank: 6, tag: "ROUTE_LOGISTICS", theme: "Маршруты, район и навигация", mentions: 5, share_pct: 0.069, priority: "P1" },
    { source_period: "Май 2026 + 1 июня", rank: 7, tag: "ORDER_QUEUE", theme: "Очередь и распределение заказов", mentions: 5, share_pct: 0.069, priority: "P1 / hidden P0" },
    { source_period: "Май 2026 + 1 июня", rank: 8, tag: "EQUIPMENT", theme: "Велосипеды, форма, термосумки", mentions: 3, share_pct: 0.042, priority: "P2 / Ops" },
    { source_period: "Май 2026 + 1 июня", rank: 9, tag: "PACKAGING_PICKING", theme: "Сборка, пакеты, полки", mentions: 3, share_pct: 0.042, priority: "P1/P2" },
    { source_period: "Май 2026 + 1 июня", rank: 10, tag: "APP_UX", theme: "Приложение и интерфейс", mentions: 3, share_pct: 0.042, priority: "P1" },
    { source_period: "Май 2026 + 1 июня", rank: 11, tag: "DELIVERY_TIME", theme: "Таймеры, опоздания и рейтинг", mentions: 3, share_pct: 0.042, priority: "P0" },
  ],
  recommendation: [
    { source_period: "До мая 2026", group: "promoter", label: "Сторонники", count: 112, share_pct: 64.0 },
    { source_period: "До мая 2026", group: "neutral", label: "Нейтральные", count: 29, share_pct: 16.6 },
    { source_period: "До мая 2026", group: "critic", label: "Критики", count: 34, share_pct: 19.4 },
    { source_period: "До мая 2026", group: "no_answer", label: "Нет ответа", count: 13, share_pct: null },
    { source_period: "Май 2026 + 1 июня", group: "promoter", label: "Сторонники", count: 54, share_pct: 72.0 },
    { source_period: "Май 2026 + 1 июня", group: "neutral", label: "Нейтральные", count: 10, share_pct: 13.3 },
    { source_period: "Май 2026 + 1 июня", group: "critic", label: "Критики", count: 11, share_pct: 14.7 },
    { source_period: "Май 2026 + 1 июня", group: "no_answer", label: "Нет ответа", count: 8, share_pct: null },
  ],
  weekly_summary: [
    { source_period: "До мая 2026", week_start: "2026-02-02", responses: 24, recommendation_score: 17.4, promoters: 10, critics: 6, comment: "База достаточная" },
    { source_period: "До мая 2026", week_start: "2026-02-09", responses: 30, recommendation_score: 55.2, promoters: 20, critics: 4, comment: "База достаточная" },
    { source_period: "До мая 2026", week_start: "2026-02-16", responses: 18, recommendation_score: 41.2, promoters: 10, critics: 3, comment: "База <20" },
    { source_period: "До мая 2026", week_start: "2026-02-23", responses: 14, recommendation_score: 15.4, promoters: 7, critics: 5, comment: "База <20" },
    { source_period: "До мая 2026", week_start: "2026-03-02", responses: 35, recommendation_score: 50.0, promoters: 20, critics: 5, comment: "База достаточная" },
    { source_period: "До мая 2026", week_start: "2026-03-16", responses: 18, recommendation_score: 31.2, promoters: 10, critics: 5, comment: "База <20" },
    { source_period: "До мая 2026", week_start: "2026-03-23", responses: 48, recommendation_score: 60.9, promoters: 34, critics: 6, comment: "База достаточная" },
    { source_period: "До мая 2026", week_start: "2026-03-30", responses: 1, recommendation_score: 100.0, promoters: 1, critics: 0, comment: "База <5 — не интерпретировать" },
    { source_period: "Май 2026 + 1 июня", week_start: "2026-05-04", responses: 1, recommendation_score: 100.0, promoters: null, critics: null, comment: "База <5" },
    { source_period: "Май 2026 + 1 июня", week_start: "2026-05-18", responses: 23, recommendation_score: 57.0, promoters: null, critics: null, comment: "База достаточная" },
    { source_period: "Май 2026 + 1 июня", week_start: "2026-05-25", responses: 13, recommendation_score: 75.0, promoters: null, critics: null, comment: "База <20" },
    { source_period: "Май 2026 + 1 июня", week_start: "2026-06-01", responses: 46, recommendation_score: 51.0, promoters: null, critics: null, comment: "База достаточная" },
  ],
  positive_drivers: [
    { source_period: "До мая 2026", positive_driver: "Куратор / коллеги / поддержка", respondent_count: 51, share_pct: 0.2713, why_important: "Показывает, что уже работает в первой неделе" },
    { source_period: "До мая 2026", positive_driver: "Деньги / бонусы / чаевые как позитив", respondent_count: 20, share_pct: 0.1064, why_important: "Финансовая мотивация работает" },
    { source_period: "До мая 2026", positive_driver: "Быстрый старт / заказы", respondent_count: 23, share_pct: 0.1223, why_important: "Скорость включения в процесс важна" },
    { source_period: "До мая 2026", positive_driver: "Понятное приложение / процесс", respondent_count: 15, share_pct: 0.0798, why_important: "UX работает на старт" },
    { source_period: "До мая 2026", positive_driver: "Свободный график", respondent_count: 7, share_pct: 0.0372, why_important: "Гибкость ценится" },
    { source_period: "Май 2026 + 1 июня", positive_driver: "Куратор / коллеги / поддержка", respondent_count: 22, share_pct: 0.265, why_important: "Остаётся главным позитивным фактором" },
    { source_period: "Май 2026 + 1 июня", positive_driver: "Быстрый старт / заказы", respondent_count: 18, share_pct: 0.217, why_important: "Скорость включения" },
    { source_period: "Май 2026 + 1 июня", positive_driver: "Понятное приложение / процесс", respondent_count: 12, share_pct: 0.145, why_important: "UX стал более заметным позитивом" },
    { source_period: "Май 2026 + 1 июня", positive_driver: "Деньги / бонусы / чаевые", respondent_count: 10, share_pct: 0.12, why_important: "Чаевые радуют новичков" },
    { source_period: "Май 2026 + 1 июня", positive_driver: "Свободный график", respondent_count: 8, share_pct: 0.096, why_important: "Гибкость ценится" },
  ],
  quotes: [
    { source_period: "До мая 2026", tag: "DELIVERY_TIME", theme: "Таймеры, опоздания и рейтинг", quote: "Основная проблема на мой взгляд в том, что в часы-пик можно вознаграждение немного увеличивать. Так как время затрачивается дольше и топливо расходуется больше.", priority: "P0" },
    { source_period: "До мая 2026", tag: "ONBOARDING", theme: "Онбординг и первые объяснения", quote: "Помощь новичкам в первые дни, объяснение правильного выполнения работы, сделать отдельное время для доставки не вмешивая в это время сборку заказа.", priority: "P0" },
    { source_period: "До мая 2026", tag: "SUPPORT_CURATOR", theme: "Куратор, наставник и поддержка", quote: "Было бы здорово доработать комнату для отдыха персонала. Хранение продуктов для питания, разогрев. Лояльность компании к сотруднику = лояльность сотрудника к компании.", priority: "P0/P1" },
    { source_period: "До мая 2026", tag: "ROUTE_LOGISTICS", theme: "Маршруты, район и навигация", quote: "Для авто курьеров отделять заказы — на более дальнее расстояние. Закрытые территории где шлагбаумы и нет подъезда к подъезду отдавать вело курьерам.", priority: "P1" },
    { source_period: "До мая 2026", tag: "ORDER_QUEUE", theme: "Очередь и распределение заказов", quote: "Плохо, когда мало заказов и простои по 25-30 мин. Плохо, когда несправедливо портится рейтинг из-за заказов, которые были взяты поздно.", priority: "P1 / hidden P0" },
    { source_period: "Май 2026 + 1 июня", tag: "PAY_MOTIVATION", theme: "Оплата, ставки, деньги, бонусы", quote: "Низкая цена вознаграждения курьера", priority: "Out / P1" },
    { source_period: "Май 2026 + 1 июня", tag: "ROUTE_LOGISTICS", theme: "Маршруты, район и навигация", quote: "Навигация — хотелось бы улучшений в приложении при построении маршрута по нескольким точкам.", priority: "P1" },
    { source_period: "Май 2026 + 1 июня", tag: "SUPPORT_CURATOR", theme: "Куратор, наставник и поддержка", quote: "То, что куратор почему-то не ставит меня в смены — приходят новые курьеры и их ставят на любые направления, а я жду.", priority: "P0/P1" },
    { source_period: "Май 2026 + 1 июня", tag: "DELIVERY_TIME", theme: "Таймеры, опоздания и рейтинг", quote: "Поставил бы хотя бы 1 электровелосипед чисто для стажёров, стажировку проходили бы 10-часовую, максимально вникая в суть работы.", priority: "P0" },
    { source_period: "Май 2026 + 1 июня", tag: "ONBOARDING", theme: "Онбординг и первые объяснения", quote: "Инструктаж, которого не было", priority: "P0" },
    { source_period: "Май 2026 + 1 июня", tag: "APP_UX", theme: "Приложение и интерфейс", quote: "Иногда глючит приложение", priority: "P1" },
  ],
  out_of_scope: [
    { source_period: "До мая 2026", tag: "PAY_MOTIVATION", theme: "Оплата / ставки", why_important: "Самая частотная тема, влияет на мотивацию и рекомендацию", owner_team: "C&B / Ops", product_hypothesis: "Прозрачность начислений, доплаты за дальность/сложность/погоду" },
    { source_period: "До мая 2026", tag: "SUPPORT_CURATOR", theme: "Отношение и качество работы кураторов", why_important: "Куратор — драйвер позитивного старта и точка отказа при плохом исполнении", owner_team: "Ops / HR", product_hypothesis: "Чек-лист куратора и контроль первого контакта" },
    { source_period: "До мая 2026", tag: "EQUIPMENT", theme: "Велосипеды, форма, термосумки", why_important: "Может блокировать комфортный старт и ранний выход на смену", owner_team: "Supply / Ops", product_hypothesis: "Статус выдачи / бронь велосипеда / комплект новичка" },
    { source_period: "До мая 2026", tag: "PHYSICAL_CONDITIONS", theme: "Условия труда и отдыха", why_important: "Влияет на долгосрочное удержание и физическое состояние", owner_team: "Ops / HR", product_hypothesis: "Стандарты комнат отдыха / инфраструктуры" },
    { source_period: "Май 2026 + 1 июня", tag: "PAY_MOTIVATION", theme: "Оплата, ставки, деньги, бонусы", why_important: "Остаётся топ-темой, частично вне продуктового влияния", owner_team: "C&B / Ops", product_hypothesis: "Разделить C&B-сигнал и продуктовые гипотезы" },
    { source_period: "Май 2026 + 1 июня", tag: "EQUIPMENT", theme: "Велосипеды, одежда, термосумки, инвентарь", why_important: "Блокирует старт и создаёт стресс", owner_team: "Supply / Ops", product_hypothesis: "Бронь велосипеда + комплект новичка" },
    { source_period: "Май 2026 + 1 июня", tag: "PACKAGING_PICKING", theme: "Сборка, пакеты, полки, поиск заказов", why_important: "Вызывает физический стресс и потерю времени", owner_team: "Ops / Product edge", product_hypothesis: "Улучшить навигацию по полкам / уменьшить брак заказов" },
    { source_period: "Май 2026 + 1 июня", tag: "PHYSICAL_CONDITIONS", theme: "Физические условия: погода, парковки, доступ", why_important: "Влияет на комфорт смены и долгосрочное удержание", owner_team: "Ops / HR", product_hypothesis: "Стандарты условий работы" },
    { source_period: "Май 2026 + 1 июня", tag: "SUPPORT_CURATOR", theme: "Куратор / поддержка / отношение", why_important: "Куратор остаётся точкой отказа при плохой работе", owner_team: "Ops / HR", product_hypothesis: "Стандарт куратора + контроль первого контакта" },
  ],
  comparison_prev_period: [
    { source_period: "Май 2026 + 1 июня", tag: "NO_PROBLEM", theme: "Нет явной проблемы / всё нормально", may_mentions: 40, may_share: 48.2, previous_mentions: 32, previous_share: 17.0, delta_pp: 31.2, trend: "усилилось", priority: "Positive / Control" },
    { source_period: "Май 2026 + 1 июня", tag: "ONBOARDING", theme: "Онбординг и первые объяснения", may_mentions: 23, may_share: 27.7, previous_mentions: 76, previous_share: 40.4, delta_pp: -12.7, trend: "ослабло", priority: "P0" },
    { source_period: "Май 2026 + 1 июня", tag: "DELIVERY_TIME", theme: "Таймеры, опоздания и рейтинг", may_mentions: 24, may_share: 28.9, previous_mentions: 68, previous_share: 36.2, delta_pp: -7.3, trend: "ослабло", priority: "P0" },
    { source_period: "Май 2026 + 1 июня", tag: "POSITIVE_EXPERIENCE", theme: "Позитивный опыт старта", may_mentions: 42, may_share: 50.6, previous_mentions: 108, previous_share: 57.4, delta_pp: -6.8, trend: "ослабло", priority: "Positive" },
    { source_period: "Май 2026 + 1 июня", tag: "PACKAGING_PICKING", theme: "Сборка, пакеты, полки, поиск заказов", may_mentions: 8, may_share: 9.6, previous_mentions: 29, previous_share: 15.4, delta_pp: -5.8, trend: "ослабло", priority: "P1/P2" },
    { source_period: "Май 2026 + 1 июня", tag: "PAY_MOTIVATION", theme: "Оплата, ставки, деньги, бонусы", may_mentions: 37, may_share: 44.6, previous_mentions: 92, previous_share: 48.9, delta_pp: -4.3, trend: "стабильно", priority: "Out / P1" },
    { source_period: "Май 2026 + 1 июня", tag: "SUPPORT_CURATOR", theme: "Куратор, наставник и поддержка", may_mentions: 28, may_share: 33.7, previous_mentions: 112, previous_share: 47.9, delta_pp: -14.2, trend: "ослабло", priority: "P0/P1" },
    { source_period: "Май 2026 + 1 июня", tag: "ROUTE_LOGISTICS", theme: "Маршруты, район и навигация", may_mentions: 32, may_share: 38.6, previous_mentions: 86, previous_share: 34.0, delta_pp: 4.6, trend: "усилилось", priority: "P1" },
    { source_period: "Май 2026 + 1 июня", tag: "APP_UX", theme: "Приложение и интерфейс", may_mentions: 12, may_share: 14.5, previous_mentions: 28, previous_share: 12.8, delta_pp: 1.7, trend: "стабильно", priority: "P1" },
  ],
};

// ─── PERIOD LOGIC ────────────────────────────────────────────────────────────
function parsePeriods(configRows) {
  const byPeriod = {};
  configRows.forEach(row => {
    const pid = row.source_period;
    if (!pid) return;
    if (!byPeriod[pid]) byPeriod[pid] = { periodId: pid, periodLabel: pid };
    const key = row.key || row.metric;
    if (key === "period_end" || key === "actual_last_response") byPeriod[pid].periodEnd = row.value;
    if (key === "period_start" || key === "actual_first_response") byPeriod[pid].periodStart = row.value;
    if (key === "total_responses") byPeriod[pid].totalResponses = Number(row.value);
    if (key === "recommendation_score") byPeriod[pid].recommendationScore = Number(row.value);
  });
  return Object.values(byPeriod);
}

function sortPeriodsDesc(periods) {
  return [...periods].sort((a, b) => {
    const aDate = new Date(a.periodEnd || a.periodStart || "1900-01-01").getTime();
    const bDate = new Date(b.periodEnd || b.periodStart || "1900-01-01").getTime();
    return bDate - aDate;
  });
}

function getCurrentPeriod(periods) {
  const explicit = periods.find(p => p.isCurrentPeriod === true);
  if (explicit) return explicit;
  return sortPeriodsDesc(periods)[0] || null;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const PRIORITY_COLORS = {
  P0: { bg: "#fff1ec", text: "#d4380d", border: "#ffa07a" },
  "P0/P1": { bg: "#fff1ec", text: "#d4380d", border: "#ffa07a" },
  P1: { bg: "#fffbe6", text: "#c07f00", border: "#ffd666" },
  "P1 / hidden P0": { bg: "#fffbe6", text: "#c07f00", border: "#ffd666" },
  "P1/P2": { bg: "#fffbe6", text: "#c07f00", border: "#ffd666" },
  P2: { bg: "#edf7ee", text: "#2e7d32", border: "#a5d6a7" },
  "P2 / Ops": { bg: "#edf7ee", text: "#2e7d32", border: "#a5d6a7" },
  "Out / P1": { bg: "#f0f0f0", text: "#555555", border: "#cccccc" },
  Positive: { bg: "#e8f5e9", text: "#1b5e20", border: "#a5d6a7" },
  "Positive / Control": { bg: "#e8f5e9", text: "#1b5e20", border: "#a5d6a7" },
  "Manual check": { bg: "#f0ecff", text: "#5b3fc9", border: "#b39ddb" },
  Control: { bg: "#e8f5e9", text: "#1b5e20", border: "#a5d6a7" },
};

function getPriorityStyle(priority) {
  return PRIORITY_COLORS[priority] || { bg: "#f5f5f5", text: "#666", border: "#ddd" };
}

function formatScore(score) {
  return score > 0 ? `+${score}` : String(score);
}

function formatPct(val) {
  if (val == null) return "—";
  const num = Number(val);
  return num > 1 ? `${Math.round(num)}%` : `${Math.round(num * 100)}%`;
}

function getConfigValue(configRows, period, keyOrMetric) {
  const row = configRows.find(r =>
    r.source_period === period && (r.key === keyOrMetric || r.metric === keyOrMetric)
  );
  return row ? row.value : null;
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f5f2ed; color: #1a1714; font-family: 'Inter', sans-serif; }

  .app { min-height: 100vh; background: #f5f2ed; }

  .topbar {
    background: #1a1714;
    color: #f5f2ed;
    padding: 0;
    display: flex;
    align-items: stretch;
    height: 52px;
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 2px solid #d4380d;
    overflow: hidden;
  }

  .topbar-title {
    font-family: 'Playfair Display', serif;
    font-size: 15px;
    letter-spacing: 0.02em;
    color: #f5f2ed;
    white-space: nowrap;
    padding: 0 20px;
    border-right: 1px solid #444;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .nav-tabs {
    display: flex;
    align-items: stretch;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    flex: 1;
  }

  .nav-tabs::-webkit-scrollbar { display: none; }

  .nav-tab {
    height: 50px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    padding: 0 16px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    cursor: pointer;
    color: #888;
    border: none;
    background: none;
    transition: color 0.15s, background 0.15s;
    white-space: nowrap;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
  }

  .nav-tab:hover { color: #f5f2ed; }
  .nav-tab.active { color: #fff; border-bottom-color: #d4380d; }
  .nav-tab.current-badge { color: #d4380d; }

  .content { max-width: 1200px; margin: 0 auto; padding: 32px 24px 80px; }

  .section { margin-bottom: 40px; }

  .section-title {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #7a7570;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e5e1db;
  }

  .page-header {
    background: #1a1714;
    color: #f5f2ed;
    border-radius: 16px;
    padding: 32px 36px;
    margin-bottom: 32px;
    position: relative;
    overflow: hidden;
  }

  .page-header::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: rgba(212,56,13,0.12);
    pointer-events: none;
  }

  .header-badge {
    display: inline-block;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 4px;
    margin-bottom: 12px;
    font-weight: 500;
  }

  .badge-current { background: rgba(212,56,13,0.25); color: #ff8a65; }
  .badge-past { background: rgba(255,255,255,0.1); color: #aaa; }

  .header-title {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    line-height: 1.2;
    margin-bottom: 8px;
  }

  .header-meta {
    font-size: 13px;
    color: #888;
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    align-items: center;
  }

  .header-meta span { display: flex; align-items: center; gap: 6px; }

  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
    margin-bottom: 32px;
  }

  .kpi-card {
    background: #fff;
    border-radius: 12px;
    padding: 18px 20px;
    border: 1px solid #ebe7e0;
  }

  .kpi-label {
    font-size: 11px;
    color: #7a7570;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 8px;
    font-family: 'IBM Plex Mono', monospace;
  }

  .kpi-value {
    font-family: 'Playfair Display', serif;
    font-size: 30px;
    color: #1a1714;
    line-height: 1;
  }

  .kpi-value.accent { color: #d4380d; }
  .kpi-value.green { color: #2e7d32; }
  .kpi-value.gold { color: #c07f00; }

  .kpi-sub { font-size: 11px; color: #7a7570; margin-top: 4px; }

  .insight-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .insight-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #ebe7e0;
    border-left: 3px solid #d4380d;
  }

  .insight-card.positive { border-left-color: #2e7d32; }
  .insight-card.warning { border-left-color: #c07f00; }
  .insight-card.action { border-left-color: #5b3fc9; }

  .insight-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #7a7570;
    margin-bottom: 8px;
  }

  .insight-text { font-size: 13px; line-height: 1.5; color: #1a1714; }

  .rec-block {
    background: #fff;
    border-radius: 16px;
    padding: 28px 32px;
    border: 1px solid #ebe7e0;
    display: flex;
    gap: 40px;
    align-items: center;
    flex-wrap: wrap;
  }

  .rec-score-big {
    font-family: 'Playfair Display', serif;
    font-size: 72px;
    line-height: 1;
    font-weight: 700;
  }

  .rec-score-big.green { color: #2e7d32; }
  .rec-score-big.gold { color: #c07f00; }
  .rec-score-big.red { color: #d4380d; }

  .stacked-bar {
    height: 24px;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    width: 100%;
    min-width: 300px;
    margin: 12px 0;
  }

  .stacked-bar-seg { height: 100%; transition: width 0.4s ease; }

  .bar-legend {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    font-size: 12px;
  }

  .bar-legend-item { display: flex; align-items: center; gap: 6px; }
  .bar-dot { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }

  .priority-board {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
  }

  .priority-column {
    border-radius: 12px;
    padding: 16px;
    border: 1px solid;
  }

  .priority-col-title {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .theme-card {
    background: #fff;
    border-radius: 8px;
    padding: 12px 14px;
    margin-bottom: 8px;
    border: 1px solid #ebe7e0;
  }

  .theme-name { font-size: 13px; font-weight: 500; margin-bottom: 4px; }
  .theme-meta { font-size: 11px; color: #7a7570; }
  .theme-trend {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 4px;
    margin-top: 6px;
    font-family: 'IBM Plex Mono', monospace;
  }
  .trend-up { background: #e8f5e9; color: #2e7d32; }
  .trend-down { background: #fff1ec; color: #d4380d; }
  .trend-stable { background: #f5f5f5; color: #666; }

  .fc-chart-wrap { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #ebe7e0; }
  .fc-bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
  .fc-bar-label { font-size: 12px; width: 190px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .fc-bar-track { flex: 1; height: 16px; background: #f0ede8; border-radius: 4px; overflow: hidden; }
  .fc-bar-fill { height: 100%; border-radius: 4px; }
  .fc-bar-count { font-size: 12px; width: 28px; text-align: right; color: #7a7570; font-family: 'IBM Plex Mono', monospace; }

  .hidden-p0-badge {
    display: inline-block;
    font-size: 10px;
    padding: 2px 8px;
    background: #f0ecff;
    color: #5b3fc9;
    border-radius: 4px;
    font-family: 'IBM Plex Mono', monospace;
    letter-spacing: 0.08em;
    font-weight: 500;
    margin-left: 6px;
  }

  .weekly-chart-wrap { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #ebe7e0; }

  .quotes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }

  .quote-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #ebe7e0;
    position: relative;
  }

  .quote-mark {
    font-family: 'Playfair Display', serif;
    font-size: 48px;
    line-height: 0.6;
    color: #ebe7e0;
    float: left;
    margin-right: 8px;
    margin-top: 8px;
  }

  .quote-text { font-size: 13px; line-height: 1.6; color: #1a1714; margin-bottom: 12px; }
  .quote-tag { font-size: 11px; font-family: 'IBM Plex Mono', monospace; color: #7a7570; }

  .priority-badge {
    display: inline-block;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.1em;
    padding: 3px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .oos-table { width: 100%; border-collapse: collapse; }
  .oos-table th {
    text-align: left;
    font-size: 11px;
    font-family: 'IBM Plex Mono', monospace;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #7a7570;
    padding: 10px 12px;
    background: #faf8f5;
    border-bottom: 1px solid #ebe7e0;
  }
  .oos-table td {
    padding: 12px;
    font-size: 12px;
    border-bottom: 1px solid #ebe7e0;
    vertical-align: top;
    line-height: 1.5;
  }

  .comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  .comp-metric-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #ebe7e0;
  }

  .comp-delta {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    padding: 2px 10px;
    border-radius: 6px;
  }

  .delta-pos { background: #e8f5e9; color: #2e7d32; }
  .delta-neg { background: #fff1ec; color: #d4380d; }
  .delta-neutral { background: #f5f5f5; color: #666; }

  .all-data-filters { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
  .filter-select {
    padding: 8px 14px;
    border: 1px solid #ebe7e0;
    border-radius: 8px;
    background: #fff;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    color: #1a1714;
    cursor: pointer;
  }

  .data-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #ebe7e0; }
  .data-table th { background: #faf8f5; padding: 10px 14px; text-align: left; font-size: 11px; font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.1em; text-transform: uppercase; color: #7a7570; border-bottom: 1px solid #ebe7e0; }
  .data-table td { padding: 10px 14px; font-size: 12px; border-bottom: 1px solid #f0ede8; }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:hover td { background: #faf8f5; }

  .period-selector {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 24px;
  }

  .period-btn {
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid #ebe7e0;
    background: #fff;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'Inter', sans-serif;
    color: #1a1714;
  }
  .period-btn:hover { border-color: #d4380d; color: #d4380d; }
  .period-btn.active { background: #1a1714; color: #f5f2ed; border-color: #1a1714; }

  .warn-banner {
    background: #fffbe6;
    border: 1px solid #ffd666;
    border-radius: 8px;
    padding: 10px 16px;
    font-size: 12px;
    color: #c07f00;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  @media (max-width: 640px) {
    .content { padding: 16px 12px 60px; }
    .rec-block { flex-direction: column; gap: 20px; }
    .comparison-grid { grid-template-columns: 1fr; }
    .header-title { font-size: 20px; }
    .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const s = getPriorityStyle(priority);
  return (
    <span className="priority-badge" style={{ background: s.bg, color: s.text }}>
      {priority}
    </span>
  );
}

function TrendBadge({ trend, delta }) {
  if (!trend) return null;
  const cls = trend === "усилилось" ? "trend-up" : trend === "ослабло" ? "trend-down" : "trend-stable";
  const arrow = trend === "усилилось" ? "↑" : trend === "ослабло" ? "↓" : "→";
  return (
    <span className={`theme-trend ${cls}`}>
      {arrow} {delta != null ? `${delta > 0 ? "+" : ""}${delta.toFixed(1)} pp` : trend}
    </span>
  );
}

function FCBar({ items, maxMentions }) {
  return (
    <div className="fc-chart-wrap">
      {items.map((item, i) => {
        const s = getPriorityStyle(item.priority);
        const isHiddenP0 = String(item.priority || "").includes("hidden P0");
        const isForced = String(item.priority || "").toLowerCase().includes("p0");
        return (
          <div key={i} className="fc-bar-row">
            <div className="fc-bar-label" title={item.theme}>
              {item.theme}
              {isHiddenP0 && <span className="hidden-p0-badge">hidden P0</span>}
            </div>
            <div className="fc-bar-track">
              <div
                className="fc-bar-fill"
                style={{
                  width: `${(item.mentions / maxMentions) * 100}%`,
                  background: s.text,
                }}
              />
            </div>
            <div className="fc-bar-count">{item.mentions}</div>
          </div>
        );
      })}
    </div>
  );
}

function StackedBar({ promotersPct, neutralsPct, criticsPct }) {
  const total = promotersPct + neutralsPct + criticsPct;
  const p = total > 0 ? (promotersPct / total) * 100 : 0;
  const n = total > 0 ? (neutralsPct / total) * 100 : 0;
  const c = total > 0 ? (criticsPct / total) * 100 : 0;
  return (
    <>
      <div className="stacked-bar">
        <div className="stacked-bar-seg" style={{ width: `${p}%`, background: "#2e7d32" }} />
        <div className="stacked-bar-seg" style={{ width: `${n}%`, background: "#c07f00" }} />
        <div className="stacked-bar-seg" style={{ width: `${c}%`, background: "#d4380d" }} />
      </div>
      <div className="bar-legend">
        <div className="bar-legend-item"><div className="bar-dot" style={{ background: "#2e7d32" }} /><span>Сторонники {Math.round(p)}%</span></div>
        <div className="bar-legend-item"><div className="bar-dot" style={{ background: "#c07f00" }} /><span>Нейтральные {Math.round(n)}%</span></div>
        <div className="bar-legend-item"><div className="bar-dot" style={{ background: "#d4380d" }} /><span>Критики {Math.round(c)}%</span></div>
      </div>
    </>
  );
}

// ─── PERIOD VIEW ─────────────────────────────────────────────────────────────
function PeriodView({ period, isCurrent, data }) {
  const pid = period.periodId;

  const config = data.dashboard_config.filter(r => r.source_period === pid);
  const getVal = (key) => {
    const row = config.find(r => r.key === key || r.metric === key);
    return row ? row.value : null;
  };

  const totalResponses = Number(getVal("total_responses") || 0);
  const validForced = Number(getVal("valid_q4_forced_choice") || getVal("valid_q4_forced") || 0);
  const validRec = Number(getVal("valid_recommendation_classified") || 0);
  const recScore = Number(getVal("recommendation_score") || 0);
  const promotersPct = Number(getVal("promoters_pct") || 0);
  const neutralsPct = Number(getVal("neutrals_pct") || 0);
  const criticsPct = Number(getVal("critics_pct") || 0);

  const themes = data.theme_summary.filter(r => r.source_period === pid);
  const p0Themes = themes.filter(r => String(r.priority || "").includes("P0") && !String(r.priority || "").includes("Positive"));
  const p1Themes = themes.filter(r => String(r.priority || "").startsWith("P1"));
  const p2Themes = themes.filter(r => String(r.priority || "").startsWith("P2"));
  const posThemes = themes.filter(r => String(r.priority || "").includes("Positive") || r.priority === "Control");

  const fcItems = data.forced_choice
    .filter(r => r.source_period === pid)
    .sort((a, b) => (b.mentions || 0) - (a.mentions || 0));
  const fcMax = Math.max(...fcItems.map(f => f.mentions || 0), 1);

  const recRows = data.recommendation.filter(r => r.source_period === pid);
  const promoterRow = recRows.find(r => r.group === "promoter");
  const neutralRow = recRows.find(r => r.group === "neutral");
  const criticRow = recRows.find(r => r.group === "critic");

  const promotersN = promoterRow?.count || 0;
  const neutralsN = neutralRow?.count || 0;
  const criticsN = criticRow?.count || 0;
  const promoterShare = promoterRow?.share_pct || promotersPct * 100;
  const neutralShare = neutralRow?.share_pct || neutralsPct * 100;
  const criticShare = criticRow?.share_pct || criticsPct * 100;

  const weekly = data.weekly_summary.filter(r => r.source_period === pid);
  const drivers = data.positive_drivers.filter(r => r.source_period === pid);
  const quotes = data.quotes.filter(r => r.source_period === pid);
  const oos = data.out_of_scope.filter(r => r.source_period === pid);

  const weeklyChartData = weekly.map(w => ({
    week: w.week_start ? String(w.week_start).slice(5, 10) : "",
    score: Number(w.recommendation_score) || 0,
    responses: Number(w.responses) || 0,
    small: (Number(w.responses) || 0) < 20,
  }));

  const scoreColor = recScore >= 50 ? "green" : recScore >= 20 ? "gold" : "red";
  const p0Count = p0Themes.length;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className={`header-badge ${isCurrent ? "badge-current" : "badge-past"}`}>
          {isCurrent ? "● Текущий период" : "Прошлый период"}
        </div>
        <div className="header-title">{period.periodLabel}</div>
        <div className="header-meta">
          <span>📅 {period.periodStart ? String(period.periodStart).slice(0, 10) : ""} — {period.periodEnd ? String(period.periodEnd).slice(0, 10) : ""}</span>
          <span>📊 {totalResponses} ответов</span>
          {!isCurrent && <span style={{ color: "#888", fontSize: 11, fontStyle: "italic" }}>Исторические данные</span>}
        </div>
      </div>

      {/* KPI cards */}
      <div className="section">
        <div className="section-title">Ключевые метрики</div>
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Всего ответов</div>
            <div className="kpi-value">{totalResponses}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Forced Choice</div>
            <div className="kpi-value">{validForced}</div>
            <div className="kpi-sub">валидных</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Recommendation</div>
            <div className="kpi-value">{validRec}</div>
            <div className="kpi-sub">классифицировано</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Rec. Score</div>
            <div className={`kpi-value ${scoreColor}`}>{recScore > 0 ? `+${recScore}` : recScore}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Сторонники</div>
            <div className="kpi-value green">{promotersN}</div>
            <div className="kpi-sub">{Math.round(Number(promoterShare))}%</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Критики</div>
            <div className="kpi-value accent">{criticsN}</div>
            <div className="kpi-sub">{Math.round(Number(criticShare))}%</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">P0 тем</div>
            <div className="kpi-value accent">{p0Count}</div>
          </div>
        </div>
      </div>

      {/* Executive insights */}
      <div className="section">
        <div className="section-title">Аналитика периода</div>
        <div className="insight-grid">
          {p0Themes[0] && (
            <div className="insight-card">
              <div className="insight-label">Главная P0 боль</div>
              <div className="insight-text">
                <strong>{p0Themes[0].theme}</strong> — {p0Themes[0].description || p0Themes[0].hypothesis || "Топ P0 тема периода"}
              </div>
            </div>
          )}
          {drivers[0] && (
            <div className="insight-card positive">
              <div className="insight-label">Позитивный драйвер</div>
              <div className="insight-text">
                <strong>{drivers[0].positive_driver}</strong> — {drivers[0].why_important}
              </div>
            </div>
          )}
          {p0Themes[1] && (
            <div className="insight-card warning">
              <div className="insight-label">Второй P0 риск</div>
              <div className="insight-text">
                <strong>{p0Themes[1].theme}</strong> — {p0Themes[1].hypothesis || "Требует внимания"}
              </div>
            </div>
          )}
          {p0Themes[0]?.hypothesis && (
            <div className="insight-card action">
              <div className="insight-label">Что сделать сейчас</div>
              <div className="insight-text">{p0Themes[0].hypothesis}</div>
            </div>
          )}
        </div>
      </div>

      {/* Recommendation score */}
      <div className="section">
        <div className="section-title">Recommendation Score</div>
        <div className="rec-block">
          <div>
            <div className={`rec-score-big ${scoreColor}`}>{recScore > 0 ? `+${recScore}` : recScore}</div>
            <div style={{ fontSize: 13, color: "#7a7570", marginTop: 8, maxWidth: 200 }}>
              {recScore >= 50 ? "Сильный результат — большинство готовы рекомендовать" : recScore >= 20 ? "Умеренный результат — есть пространство для роста" : "Низкий результат — критиков много, нужны срочные улучшения"}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <StackedBar
              promotersPct={Number(promoterShare)}
              neutralsPct={Number(neutralShare)}
              criticsPct={Number(criticShare)}
            />
            <div style={{ fontSize: 12, color: "#7a7570", marginTop: 12 }}>
              Сторонники: {promotersN} · Нейтральные: {neutralsN} · Критики: {criticsN}
            </div>
          </div>
        </div>
      </div>

      {/* Priority board */}
      <div className="section">
        <div className="section-title">Priority Board</div>
        <div className="priority-board">
          {p0Themes.length > 0 && (
            <div className="priority-column" style={{ background: "#fff1ec", borderColor: "#ffa07a" }}>
              <div className="priority-col-title" style={{ color: "#d4380d" }}>P0 — Критично</div>
              {p0Themes.map((t, i) => (
                <div key={i} className="theme-card">
                  <div className="theme-name">{t.theme}</div>
                  {t.mentions != null && <div className="theme-meta">{t.mentions} упом. · {t.share}%</div>}
                  {t.trend && <TrendBadge trend={t.trend} delta={t.share_delta_pp} />}
                </div>
              ))}
            </div>
          )}
          {p1Themes.length > 0 && (
            <div className="priority-column" style={{ background: "#fffbe6", borderColor: "#ffd666" }}>
              <div className="priority-col-title" style={{ color: "#c07f00" }}>P1 — Важно</div>
              {p1Themes.map((t, i) => (
                <div key={i} className="theme-card">
                  <div className="theme-name">{t.theme}</div>
                  {t.mentions != null && <div className="theme-meta">{t.mentions} упом. · {t.share}%</div>}
                  {t.trend && <TrendBadge trend={t.trend} delta={t.share_delta_pp} />}
                </div>
              ))}
            </div>
          )}
          {p2Themes.length > 0 && (
            <div className="priority-column" style={{ background: "#edf7ee", borderColor: "#a5d6a7" }}>
              <div className="priority-col-title" style={{ color: "#2e7d32" }}>P2 — Следим</div>
              {p2Themes.map((t, i) => (
                <div key={i} className="theme-card">
                  <div className="theme-name">{t.theme}</div>
                  {t.mentions != null && <div className="theme-meta">{t.mentions} упом.</div>}
                </div>
              ))}
            </div>
          )}
          {posThemes.length > 0 && (
            <div className="priority-column" style={{ background: "#e8f5e9", borderColor: "#c8e6c9" }}>
              <div className="priority-col-title" style={{ color: "#1b5e20" }}>Позитивное</div>
              {posThemes.map((t, i) => (
                <div key={i} className="theme-card">
                  <div className="theme-name">{t.theme}</div>
                  {t.mentions != null && <div className="theme-meta">{t.mentions} упом.</div>}
                  {t.trend && <TrendBadge trend={t.trend} delta={t.share_delta_pp} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Forced choice */}
      {fcItems.length > 0 && (
        <div className="section">
          <div className="section-title">Forced Choice — топ тем</div>
          <FCBar items={fcItems.slice(0, 10)} maxMentions={fcMax} />
        </div>
      )}

      {/* Weekly dynamics */}
      {weeklyChartData.length > 1 && (
        <div className="section">
          <div className="section-title">Недельная динамика</div>
          <div className="weekly-chart-wrap">
            {weeklyChartData.some(w => w.small) && (
              <div className="warn-banner">⚠ Недели с менее чем 20 ответами — интерпретировать как сигнал, не как тренд</div>
            )}
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} />
                <YAxis tick={{ fontSize: 11 }} domain={[-20, 120]} />
                <Tooltip
                  contentStyle={{ fontSize: 12, fontFamily: "Inter", border: "1px solid #ebe7e0", borderRadius: 8 }}
                  formatter={(val, name) => [name === "score" ? `+${val}` : val, name === "score" ? "Rec. Score" : "Ответов"]}
                />
                <Legend formatter={v => v === "score" ? "Rec. Score" : "Ответов"} wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="score" stroke="#d4380d" strokeWidth={2} dot={{ r: 4 }} name="score" />
                <Line type="monotone" dataKey="responses" stroke="#7a7570" strokeWidth={1.5} strokeDasharray="4 2" dot={{ r: 3 }} name="responses" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Positive drivers */}
      {drivers.length > 0 && (
        <div className="section">
          <div className="section-title">Позитивные драйверы</div>
          <div className="priority-board">
            {drivers.map((d, i) => (
              <div key={i} className="theme-card" style={{ background: "#fff", border: "1px solid #c8e6c9" }}>
                <div className="theme-name" style={{ color: "#2e7d32" }}>✓ {d.positive_driver}</div>
                <div className="theme-meta">{d.respondent_count} респ. · {d.share_pct != null ? formatPct(d.share_pct) : ""}</div>
                {d.why_important && <div style={{ fontSize: 12, color: "#7a7570", marginTop: 6 }}>{d.why_important}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Out of scope */}
      {oos.length > 0 && (
        <div className="section">
          <div className="section-title">Out of scope — для смежных команд</div>
          <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #ebe7e0" }}>
            <table className="oos-table">
              <thead>
                <tr>
                  <th>Тема</th>
                  <th>Команда</th>
                  <th>Почему важно</th>
                  <th>Гипотеза</th>
                </tr>
              </thead>
              <tbody>
                {oos.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{r.theme}</td>
                    <td><span style={{ background: "#f0f0f0", color: "#555", fontSize: 11, padding: "2px 8px", borderRadius: 4, fontFamily: "IBM Plex Mono" }}>{r.owner_team}</span></td>
                    <td>{r.why_important}</td>
                    <td style={{ color: "#7a7570" }}>{r.product_hypothesis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quotes */}
      {quotes.length > 0 && (
        <div className="section">
          <div className="section-title">Цитаты по ключевым темам</div>
          <div className="quotes-grid">
            {quotes.map((q, i) => {
              const s = getPriorityStyle(q.priority);
              return (
                <div key={i} className="quote-card">
                  <PriorityBadge priority={q.priority} />
                  <span className="quote-mark">"</span>
                  <div className="quote-text">{q.quote}</div>
                  <div className="quote-tag">{q.theme}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── COMPARISON VIEW ──────────────────────────────────────────────────────────
function ComparisonView({ currentPeriod, prevPeriod, data }) {
  if (!currentPeriod || !prevPeriod) {
    return <div style={{ padding: 40, textAlign: "center", color: "#7a7570" }}>Недостаточно периодов для сравнения.</div>;
  }

  const curr = currentPeriod.periodId;
  const prev = prevPeriod.periodId;

  const getConfig = (pid, key) => {
    const row = data.dashboard_config.find(r => r.source_period === pid && (r.key === key || r.metric === key));
    return row ? Number(row.value) : null;
  };

  const metrics = [
    { label: "Rec. Score", curr: getConfig(curr, "recommendation_score"), prev: getConfig(prev, "recommendation_score"), higherBetter: true },
    { label: "Всего ответов", curr: getConfig(curr, "total_responses"), prev: getConfig(prev, "total_responses"), higherBetter: true },
    { label: "Сторонники %", curr: getConfig(curr, "promoters_pct") || getConfig(curr, "promoters_pct"), prev: getConfig(prev, "promoters_pct"), higherBetter: true, pct: true },
    { label: "Критики %", curr: getConfig(curr, "critics_pct"), prev: getConfig(prev, "critics_pct"), higherBetter: false, pct: true },
  ];

  const comparison = data.comparison_prev_period || [];

  return (
    <div>
      <div className="page-header">
        <div className="header-badge badge-current">Сравнение периодов</div>
        <div className="header-title">{currentPeriod.periodLabel} vs {prevPeriod.periodLabel}</div>
      </div>

      <div className="section">
        <div className="section-title">Ключевые метрики</div>
        <div className="comparison-grid">
          {metrics.map((m, i) => {
            if (m.curr == null || m.prev == null) return null;
            const delta = m.curr - m.prev;
            const isGood = m.higherBetter ? delta >= 0 : delta <= 0;
            const deltaCls = Math.abs(delta) < 1 ? "delta-neutral" : isGood ? "delta-pos" : "delta-neg";
            return (
              <div key={i} className="comp-metric-card">
                <div style={{ fontSize: 11, fontFamily: "IBM Plex Mono", color: "#7a7570", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>{m.label}</div>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#7a7570", marginBottom: 4 }}>{prevPeriod.periodLabel}</div>
                    <div style={{ fontSize: 28, fontFamily: "Playfair Display", color: "#7a7570" }}>{m.pct ? `${Math.round(m.prev * 100)}%` : m.prev}</div>
                  </div>
                  <div style={{ fontSize: 20, color: "#ebe7e0" }}>→</div>
                  <div>
                    <div style={{ fontSize: 11, color: "#1a1714", marginBottom: 4 }}>{currentPeriod.periodLabel}</div>
                    <div style={{ fontSize: 28, fontFamily: "Playfair Display", color: "#1a1714" }}>{m.pct ? `${Math.round(m.curr * 100)}%` : m.curr}</div>
                  </div>
                  <div className={`comp-delta ${deltaCls}`}>
                    {delta >= 0 ? "+" : ""}{m.pct ? `${Math.round(delta * 100)} pp` : delta.toFixed(1)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {comparison.length > 0 && (
        <div className="section">
          <div className="section-title">Динамика тем</div>
          <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #ebe7e0" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Тема</th>
                  <th>Приоритет</th>
                  <th>{prevPeriod.periodLabel} %</th>
                  <th>{currentPeriod.periodLabel} %</th>
                  <th>Дельта</th>
                  <th>Тренд</th>
                </tr>
              </thead>
              <tbody>
                {comparison.sort((a, b) => Math.abs(b.delta_pp || 0) - Math.abs(a.delta_pp || 0)).map((r, i) => {
                  const s = getPriorityStyle(r.priority);
                  const delta = r.delta_pp || 0;
                  const trendCls = r.trend === "усилилось" ? "trend-up" : r.trend === "ослабло" ? "trend-down" : "trend-stable";
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{r.theme}</td>
                      <td><span style={{ background: s.bg, color: s.text, fontSize: 10, padding: "2px 8px", borderRadius: 4, fontFamily: "IBM Plex Mono" }}>{r.priority}</span></td>
                      <td style={{ fontFamily: "IBM Plex Mono" }}>{r.previous_share}%</td>
                      <td style={{ fontFamily: "IBM Plex Mono" }}>{r.may_share}%</td>
                      <td style={{ fontFamily: "IBM Plex Mono" }}>
                        <span style={{ color: delta > 0 ? "#2e7d32" : delta < 0 ? "#d4380d" : "#666" }}>
                          {delta > 0 ? "+" : ""}{delta.toFixed(1)} pp
                        </span>
                      </td>
                      <td><span className={`theme-trend ${trendCls}`}>{r.trend === "усилилось" ? "↑" : r.trend === "ослабло" ? "↓" : "→"} {r.trend}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ALL DATA VIEW ────────────────────────────────────────────────────────────
function AllDataView({ periods, data }) {
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [filterSheet, setFilterSheet] = useState("theme_summary");

  const sheets = ["theme_summary", "forced_choice", "weekly_summary", "recommendation", "positive_drivers", "quotes", "out_of_scope"];
  const rows = useMemo(() => {
    const sheet = data[filterSheet] || [];
    if (filterPeriod === "all") return sheet;
    return sheet.filter(r => r.source_period === filterPeriod);
  }, [filterPeriod, filterSheet, data]);

  const cols = rows.length > 0 ? Object.keys(rows[0]).filter(k => !["source_file", "source_sheet", "unnamed_col"].includes(k)) : [];

  return (
    <div>
      <div className="page-header">
        <div className="header-badge badge-past">Все данные</div>
        <div className="header-title">Полный датасет</div>
      </div>

      <div className="all-data-filters">
        <select className="filter-select" value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}>
          <option value="all">Все периоды</option>
          {periods.map(p => <option key={p.periodId} value={p.periodId}>{p.periodLabel}</option>)}
        </select>
        <select className="filter-select" value={filterSheet} onChange={e => setFilterSheet(e.target.value)}>
          {sheets.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span style={{ fontSize: 12, color: "#7a7570", padding: "8px 0" }}>{rows.length} строк</span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>{cols.map(c => <th key={c}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {rows.slice(0, 100).map((row, i) => (
              <tr key={i}>
                {cols.map(c => (
                  <td key={c} style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={String(row[c] ?? "")}>
                    {row[c] != null ? String(row[c]).slice(0, 80) : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 100 && <div style={{ textAlign: "center", padding: 16, color: "#7a7570", fontSize: 12 }}>Показаны первые 100 из {rows.length} строк</div>}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("current");
  const [activePastPeriod, setActivePastPeriod] = useState(null);

  const periods = useMemo(() => parsePeriods(RAW_DATA.dashboard_config), []);
  const sortedPeriods = useMemo(() => sortPeriodsDesc(periods), [periods]);
  const currentPeriod = useMemo(() => getCurrentPeriod(periods), [periods]);
  const pastPeriods = useMemo(() =>
    sortedPeriods.filter(p => p.periodId !== currentPeriod?.periodId),
    [sortedPeriods, currentPeriod]
  );
  const prevPeriod = pastPeriods[0] || null;

  useEffect(() => {
    if (pastPeriods.length > 0 && !activePastPeriod) {
      setActivePastPeriod(pastPeriods[0].periodId);
    }
  }, [pastPeriods]);

  const displayedPastPeriod = pastPeriods.find(p => p.periodId === activePastPeriod) || pastPeriods[0];

  return (
    <div className="app">
      <style>{css}</style>

      <nav className="topbar">
        <div className="topbar-title">Опрос новичков-курьеров</div>
        <div className="nav-tabs">
          <button
            className={`nav-tab current-badge ${activeTab === "current" ? "active" : ""}`}
            onClick={() => setActiveTab("current")}
          >
            Текущий: {currentPeriod?.periodLabel || "—"}
          </button>

          {pastPeriods.length > 0 && (
            <button
              className={`nav-tab ${activeTab === "past" ? "active" : ""}`}
              onClick={() => setActiveTab("past")}
            >
              Прошлые периоды
            </button>
          )}

          {sortedPeriods.length >= 2 && (
            <button
              className={`nav-tab ${activeTab === "compare" ? "active" : ""}`}
              onClick={() => setActiveTab("compare")}
            >
              Сравнение
            </button>
          )}

          <button
            className={`nav-tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            Все данные
          </button>
        </div>
      </nav>

      <div className="content">
        {activeTab === "current" && currentPeriod && (
          <PeriodView period={currentPeriod} isCurrent={true} data={RAW_DATA} />
        )}

        {activeTab === "past" && (
          <div>
            {pastPeriods.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "#7a7570" }}>Нет прошлых периодов.</div>
            ) : (
              <>
                <div className="period-selector">
                  {pastPeriods.map(p => (
                    <button
                      key={p.periodId}
                      className={`period-btn ${activePastPeriod === p.periodId ? "active" : ""}`}
                      onClick={() => setActivePastPeriod(p.periodId)}
                    >
                      {p.periodLabel}
                    </button>
                  ))}
                </div>
                {displayedPastPeriod && (
                  <PeriodView period={displayedPastPeriod} isCurrent={false} data={RAW_DATA} />
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "compare" && (
          <ComparisonView currentPeriod={currentPeriod} prevPeriod={prevPeriod} data={RAW_DATA} />
        )}

        {activeTab === "all" && (
          <AllDataView periods={sortedPeriods} data={RAW_DATA} />
        )}
      </div>
    </div>
  );
}
