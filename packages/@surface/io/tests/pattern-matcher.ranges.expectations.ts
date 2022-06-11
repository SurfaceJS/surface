/* eslint-disable import/prefer-default-export */

const skip = false;

export type Scenario =
{
    pattern: `{${number}..${number}}`,
    regex:   RegExp,
    skip:    boolean,
};

export const scenarios: Scenario[] =
[
    {
        skip,
        pattern: "{0..10}",
        regex:   /^(?:10|\d)$/,
    },
    {
        skip,
        pattern: "{5..10}",
        regex:   /^(?:10|[5-9])$/,
    },
    {
        skip,
        pattern: "{0..15}",
        regex:   /^(?:1[0-5]|\d)$/,
    },
    {
        skip,
        pattern: "{5..15}",
        regex:   /^(?:1[0-5]|[5-9])$/,
    },
    {
        skip,
        pattern: "{10..15}",
        regex:   /^(?:1[0-5])$/,
    },
    {
        skip,
        pattern: "{0..25}",
        regex:   /^(?:2[0-5]|1?\d)$/,
    },
    {
        skip,
        pattern: "{10..25}",
        regex:   /^(?:2[0-5]|1\d)$/,
    },
    {
        skip,
        pattern: "{0..50}",
        regex:   /^(?:50|[1-4]?\d)$/,
    },
    {
        skip,
        pattern: "{10..50}",
        regex:   /^(?:50|[1-4]\d)$/,
    },
    {
        skip,
        pattern: "{25..50}",
        regex:   /^(?:50|2[5-9]|[34]\d)$/,
    },
    {
        skip,
        pattern: "{45..50}",
        regex:   /^(?:50|4[5-9])$/,
    },
    {
        skip,
        pattern: "{49..50}",
        regex:   /^(?:50|49)$/,
    },
    {
        skip,
        pattern: "{0..100}",
        regex:   /^(?:100|[1-9]?\d)$/,
    },
    {
        skip,
        pattern: "{25..100}",
        regex:   /^(?:100|2[5-9]|[3-9]\d)$/,
    },
    {
        skip,
        pattern: "{50..100}",
        regex:   /^(?:100|[5-9]\d)$/,
    },
    {
        skip,
        pattern: "{95..100}",
        regex:   /^(?:100|9[5-9])$/,
    },
    {
        skip,
        pattern: "{99..100}",
        regex:   /^(?:100|99)$/,
    },
    {
        skip,
        pattern: "{0..150}",
        regex:   /^(?:150|1[0-4]\d|[1-9]?\d)$/,
    },
    {
        skip,
        pattern: "{5..150}",
        regex:   /^(?:150|1[0-4]\d|[1-9]\d|[5-9])$/,
    },
    {
        skip,
        pattern: "{25..150}",
        regex:   /^(?:150|1[0-4]\d|2[5-9]|[3-9]\d)$/,
    },
    {
        skip,
        pattern: "{50..150}",
        regex:   /^(?:150|1[0-4]\d|[5-9]\d)$/,
    },
    {
        skip,
        pattern: "{99..150}",
        regex:   /^(?:150|1[0-4]\d|99)$/,
    },
    {
        skip,
        pattern: "{100..150}",
        regex:   /^(?:150|1[0-4]\d)$/,
    },
    {
        skip:    true,
        pattern: "{125..150}",
        regex:   /^(?:150|1[3-4]\d|12[5-9])$/,
    },
    {
        skip,
        pattern: "{145..150}",
        regex:   /^(?:150|14[5-9])$/,
    },
    {
        skip,
        pattern: "{0..500}",
        regex:   /^(?:500|[1-4]\d{2}|[1-9]\d|\d)$/,
    },
    {
        skip,
        pattern: "{5..500}",
        regex:   /^(?:500|[1-4]\d{2}|[1-9]\d|[5-9])$/,
    },
    {
        skip,
        pattern: "{10..500}",
        regex:   /^(?:500|[1-4]\d{2}|[1-9]\d)$/,
    },
    {
        skip,
        pattern: "{25..500}",
        regex:   /^(?:500|[1-4]\d{2}|2[5-9]|[3-9]\d)$/,
    },
    {
        skip,
        pattern: "{50..500}",
        regex:   /^(?:500|[1-4]\d{2}|[5-9]\d)$/,
    },
    {
        skip,
        pattern: "{95..500}",
        regex:   /^(?:500|[1-4]\d{2}|9[5-9])$/,
    },
    {
        skip,
        pattern: "{100..500}",
        regex:   /^(?:500|[1-4]\d{2})$/,
    },
    {
        skip,
        pattern: "{105..500}",
        regex:   /^(?:500|10[5-9]|1[1-9]\d|[2-4]\d{2})$/,
    },
    {
        skip,
        pattern: "{110..500}",
        regex:   /^(?:500|11\d|1[2-9]\d|[2-4]\d{2})$/, // TODO: Optimize
    },
    {
        skip,
        pattern: "{125..500}",
        regex:   /^(?:500|12[5-9]|1[3-9]\d|[2-4]\d{2})$/,
    },
    {
        skip,
        pattern: "{150..500}",
        regex:   /^(?:500|15\d|1[6-9]\d|[2-4]\d{2})$/,
    },
    {
        skip:       true,
        pattern: "{190..500}",
        regex:   /^(?:500|19\d|19\d|[2-4]\d{2})$/, // TODO: Remove duplication
    },
    {
        skip:       true,
        pattern: "{195..500}",
        regex:   /^(?:500|19\d|19\d|[2-4]\d{2})$/,
    },
];
