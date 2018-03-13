import "./fixtures/dom";

import BindExpressionVisitor from "../internal/bind-expression-visitor";

import Expression from "@surface/expression";

describe
(
    "Bind should work",
    () =>
    {
        it
        (
            "One way",
            () =>
            {
                const context =
                {
                    this: new class
                    {
                        private _value: number = 1;
                        public get value(): number
                        {
                            return this._value;
                        }

                        public set value(value: number)
                        {
                            this._value = value;
                        }
                    }()
                };

                const expression = Expression.from("this.value", context);
                const visitor    = new BindExpressionVisitor(() => console.log("Changed"));

                visitor.visit(expression);

                context.this.value = 2;
            }
        );
    }
);