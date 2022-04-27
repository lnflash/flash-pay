SELECT 
    ROUND(COALESCE(MUL( COALESCE(1 + funding_rate, 1) ) - 1, 0), 15) as  funding_yield
FROM dealer.funding_rates 
WHERE funding_rate IS NOT NULL
AND exchange_id = (SELECT id FROM dealer.exchanges where exchange_name = lower(${exchangeName}))
AND timestamp >= current_timestamp - make_interval(days => ${numberOfDays});
