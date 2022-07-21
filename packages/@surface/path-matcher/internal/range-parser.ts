/* eslint-disable complexity */
/* eslint-disable max-statements */

type RangeValue =
{
    ceiling: string,
    value:   string,
};

type RangeInfo =
{
    start:        RangeValue,
    end:          RangeValue,
    sign:         string,
    intersection: number | null,
};

function createExtendedRange(min: number, max: number, minQuantifier: number = 1, maxQuantifier: number = 0): string
{
    return createRange(min, max) + createRange(0, 9, minQuantifier, maxQuantifier);
}

function createLeadingZeros(size: number): string
{
    switch (size)
    {
        case 0:
            return "";
        case 1:
            return "0";
        case 2:
            return "00";
        default:
            return `0{${size}}`;
    }
}

function createRange(min: number, max: number, minQuantifier: number = 1, maxQuantifier: number = 0): string
{
    if (minQuantifier + maxQuantifier == 0)
    {
        return "";
    }

    const range = min == max
        ? String(max)
        : min == 0 && max == 9
            ? "\\d"
            : `[${min}${max - min > 1 ? "-" : ""}${max}]`;

    const quantifier = minQuantifier < maxQuantifier
        ? `{${minQuantifier},${maxQuantifier}}`
        : minQuantifier > 1
            ? `{${minQuantifier}}`
            : "";

    return range + quantifier;
}

function getRangeInfo(start: number, end: number): RangeInfo
{
    const startString = start.toString().replace("-", "");
    const endString   = end.toString().replace("-", "");

    let intersection: number | null = null;

    if (startString.length == endString.length)
    {
        intersection = -1;

        for (let index = 0; index < endString.length; index++)
        {
            if (startString[index] != endString[index])
            {
                break;
            }

            intersection = index;
        }
    }

    const startValue = start.toString().replace("-", "");
    const endValue   = end.toString().replace("-", "");

    return {
        start:
        {
            ceiling: startValue[0] + createLeadingZeros(startValue.length - 1),
            value:   startValue,
        },
        end:
        {
            ceiling: endValue[0] + createLeadingZeros(endValue.length - 1),
            value:   endValue,
        },
        sign:    end < 0 ? "-" : "",
        intersection,
    };
}

function parseRange(start: number, end: number, minLength: number): string
{
    const patterns: string[] = [];

    const range = getRangeInfo(start, end);

    const leading = createLeadingZeros(Math.max(minLength - range.end.value.length, 0));

    for (let i = range.end.value.length - 1; i > -1; i--)
    {
        if (i - 1 == range.intersection)
        {
            break;
        }

        const digit = Number(range.end.value[i]);

        if (digit == 0 && i == range.end.value.length - 1)
        {
            patterns.push(range.sign + leading + range.end.value);
        }
        else if (i > 0 && digit > 0 || i == 0 && digit > 1)
        {
            const rest       = range.end.value.length - i - 1;
            const startRange = i == 0 ? 1 : 0;
            const endRange   = digit - (i == range.end.value.length - 1 ? 0 : 1);

            const pattern = range.sign + leading + range.end.value.substring(0, i) + createExtendedRange(startRange, endRange, rest);

            if (patterns.length > 0)
            {
                patterns.push("|");
            }

            patterns.push(pattern);
        }
    }

    if (start == 0)
    {
        const rest = range.end.value.length - 1;

        if (rest > 1)
        {
            if (minLength == 1)
            {
                patterns.push("|", range.sign + createExtendedRange(1, 9, 1, rest - 1));
            }
            else
            {
                for (let index = rest - 1; index > 0; index--)
                {
                    const leading = createLeadingZeros(minLength - index - 1);

                    patterns.push("|", range.sign + leading + createExtendedRange(1, 9, index));
                }
            }
        }

        if (range.sign)
        {
            patterns.push("|", createLeadingZeros(minLength - 1) + range.sign + createRange(1, 9));
            patterns.push("|", createLeadingZeros(minLength));
        }
        else
        {
            patterns.push("|", createLeadingZeros(minLength - 1) + createRange(0, 9));
        }
    }
    else if (range.start.value == range.start.ceiling && range.intersection == -1)
    {
        patterns.push("|", range.sign + createExtendedRange(Number(range.start.value[0]), Number(range.end.value[0]) - 1, range.start.value.length - 1));
    }
    else
    {
        const rest = range.end.value.length - range.start.value.length;

        if (rest > 1)
        {
            if (minLength == 1)
            {
                patterns.push("|", range.sign + createExtendedRange(1, 9, range.start.value.length, range.end.value.length - 2));
            }
            else
            {
                for (let index = range.end.value.length - 2; index > range.start.value.length - 1; index--)
                {
                    const leading = createLeadingZeros(Math.max(minLength - index - 1, 0));

                    patterns.push("|", range.sign + leading + createExtendedRange(1, 9, index));
                }
            }
        }

        const leading = createLeadingZeros(Math.max(minLength - range.start.value.length, 0));

        for (let i = range.start.value.length - 1; i > -1; i--)
        {
            const startDigit = Number(range.start.value[i]);
            const endDigit   = Number(range.end.value[i]);

            const hasIntersected = i == range.intersection;
            const willIntersect  = i - 1 == range.intersection;

            if (hasIntersected || willIntersect && endDigit - startDigit < 2)
            {
                break;
            }

            const isTrailingDigit = i == range.start.value.length - 1;
            const canResolveZero  = startDigit == 0 && (willIntersect || i == 1 && !isTrailingDigit);
            const canResolveNine  = startDigit == 9 && range.start.value[i + 1] == "0";

            if (startDigit == 9 && isTrailingDigit)
            {
                if (patterns.length > 0)
                {
                    patterns.push("|");
                }

                patterns.push(range.sign + leading + range.start.value);
            }
            else if (canResolveZero || canResolveNine || startDigit > 0 && startDigit < 9)
            {
                const rest        = range.start.value.length - i - 1;
                const startOffset = isTrailingDigit || range.start.value[i + 1] == "0" && (i > 0 || range.start.value.length == 2) ? 0 : 1;
                const endOffset   = isTrailingDigit ? 0 : 1;
                const startRange  = startDigit + startOffset;
                const endRange    = startDigit < 9 && willIntersect ? endDigit - endOffset : 9;

                const pattern = range.sign + leading + range.start.value.substring(0, i) + createExtendedRange(startRange, endRange, rest);

                if (patterns.length > 0)
                {
                    patterns.push("|");
                }

                patterns.push(pattern);
            }
        }
    }

    return patterns.join("");
}

function parseSteppedRange(start: number, end: number, multiplier: number, minLength: number): string
{
    const positives: string[] = [];
    const negatives: string[] = [];

    for (let i = start; i <= end; i += multiplier)
    {
        const patterns = i >= 0 ? positives : negatives;

        if (patterns.length > 0)
        {
            patterns.push("|");
        }

        const value = Math.abs(i).toString();

        if (value == "0")
        {
            patterns.push(createLeadingZeros(minLength));
        }
        else
        {
            patterns.push(createLeadingZeros(Math.max(minLength - value.length, 0)) + value);
        }
    }

    if (negatives.length > 0)
    {
        return ["-(?:", ...negatives, ")", "|", ...positives].join("");
    }

    return negatives.concat(positives).join("");
}

export function parseAlphaRange(startChar: string, endChar: string, multiplier: number): string
{
    const tokens: string[] = [];

    const startRange = startChar.charCodeAt(0);
    const endRange   = endChar.charCodeAt(0);

    if (multiplier != 0)
    {
        tokens.push("[");

        const isValidRange = startRange < endRange
            && (
                startChar == startChar.toLowerCase() && endChar == endChar.toLowerCase()
                || startChar == startChar.toUpperCase() && endChar == endChar.toUpperCase()
            );

        if (multiplier == 1 && isValidRange)
        {
            tokens.push(`${String.fromCharCode(startRange)}-${String.fromCharCode(endRange)}`);
        }

        else
        {
            for (let i = startRange; i <= endRange; i += multiplier)
            {
                const char = String.fromCharCode(i);

                if (char != "\\")
                {
                    if (char == "]" || char == "^")
                    {
                        tokens.push("\\");
                    }

                    tokens.push(char);
                }
            }
        }

        tokens.push("]");
    }

    return tokens.join("");
}

export function parseNumericRange(startRange: string, endRange: string, multiplier: number): string
{
    const tokens: string[] = [];

    const getMinLength = (value: string): number =>
    {
        const abs = value.replace("-", "");

        return abs.startsWith("0") ? abs.length : 1;
    };

    const minLength = Math.max(getMinLength(startRange), getMinLength(endRange));

    const parsedStartRange = Number(startRange);
    const parsedEndRange   = Number(endRange);

    const start = Math.min(parsedStartRange, parsedEndRange);
    const end   = Math.max(parsedStartRange, parsedEndRange);

    const inSimpleRange = (value: number): boolean => value >= 0 && value <= 9;

    if (multiplier == 1)
    {
        if (inSimpleRange(start) && inSimpleRange(end))
        {
            if (minLength > 1)
            {
                tokens.push(createLeadingZeros(minLength - 1));
            }

            tokens.push("[");
            tokens.push(`${start.toString()}-${end.toString()}`);
            tokens.push("]");
        }
        else if (start >= 0 && end > 0)
        {
            tokens.push(parseRange(start, end, minLength));
        }
        else if (start < 0 && end <= 0)
        {
            tokens.push(parseRange(end, start, minLength));
        }
        else
        {
            tokens.push(parseRange(0, start, minLength));
            tokens.push("|");
            tokens.push(parseRange(1, end, minLength));
        }
    }
    else if (inSimpleRange(start) && inSimpleRange(end))
    {
        tokens.push(createLeadingZeros(minLength - 1));

        tokens.push("[");

        for (let i = start; i <= end; i += multiplier)
        {
            tokens.push(i.toString());
        }

        tokens.push("]");
    }
    else
    {
        tokens.push(parseSteppedRange(start, end, multiplier, minLength));
    }

    return tokens.join("");
}
