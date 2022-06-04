/* eslint-disable import/prefer-default-export */
import type { Scenario } from "./pattern-matcher.expectations.js";

const skip = false;

export const scenarios: Scenario[] =
[
    {
        skip,
        pattern:   "{-13579..0}",
        regex:     /^(?:-1357[0-9]|-135[0-6][0-9]|-13[0-4][0-9]{2}|-1[0-2][0-9]{3}|(?!-0)(?!0\d)-[0-9]{1,4}|0)$/,
        matches:
        [
            "-13579",
            "-13570",
            "-13500",
            "-13000",
            "-10000",
            "-5000",
            "-1000",
            "-500",
            "-50",
            "-10",
            "-5",
            "-1",
            "0",
        ],
        unmatches:
        [
            "-20000",
            "-14000",
            "-13600",
            "-13580",
            "-0",
            "1",
            "5",
            "10",
            "50",
            "500",
            "1000",
            "5000",
            "10000",
            "13000",
            "13500",
            "13570",
            "13579",
        ],
    },
    {
        skip,
        pattern:   "{-13579..-5}",
        regex:     /^(?:-1357[0-9]|-135[0-6][0-9]|-13[0-4][0-9]{2}|-1[0-2][0-9]{3}|-[1-9][0-9]{1,3}|-[5-9])$/,
        matches:
        [
            "-13579",
            "-13570",
            "-13500",
            "-13000",
            "-10000",
            "-5000",
            "-1000",
            "-500",
            "-50",
            "-10",
            "-5",
        ],
        unmatches:
        [
            "-20000",
            "-14000",
            "-13600",
            "-13580",
            "-1",
            "0",
            "-0",
            "1",
            "5",
            "10",
            "50",
            "500",
            "1000",
            "5000",
            "10000",
            "13000",
            "13500",
            "13570",
            "13579",
        ],
    },
    {
        skip,
        pattern:   "{-13579..-10}",
        regex:     /^(?:-1357[0-9]|-135[0-6][0-9]|-13[0-4][0-9]{2}|-1[0-2][0-9]{3}|(?!-0)(?!0\d)-[0-9]{4}|-[1-9][0-9]{2,3}|-1[0-9]|-[2-9][0-9])$/,
        matches:
        [
            "-13579",
            "-13570",
            "-13500",
            "-13000",
            "-10000",
            "-5000",
            "-1000",
            "-500",
            "-50",
            "-10",
        ],
        unmatches:
        [
            "-20000",
            "-14000",
            "-13600",
            "-13580",
            "-5",
            "-1",
            "0",
            "-0",
            "1",
            "5",
            "10",
            "50",
            "500",
            "1000",
            "5000",
            "10000",
            "13000",
            "13500",
            "13570",
            "13579",
        ],
    },
];
