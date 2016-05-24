import { factory } from "industry"
import { chain } from "industry-chain"
import { exception } from "industry-exception"
import { instance } from "industry-instance"
import { functions } from "industry-functions"
import { standard_io } from "industry-standard-io"
import { trace } from "../../"

describe("IndustryTrace", () => {
  function makeTest() {
    return factory()
      .set("exception", exception)
      .set("instance", instance)
      .set("functions", functions)
      .set("trace", trace)
      .set("standard_io", standard_io)
      .set("chain", chain)
  }

  it("works", (done) => {
    let base = class {
      a({ chain: { each } }) {
        return each(this.b, this.c)
      }
      b({ chain: { each } }) {
        return each(this.c)
      }
      c({ chain: { each } }) {
        return { c: 3 }
      }
    }
    let test = makeTest().base(base)
    test().a().then(done)
  })
})
