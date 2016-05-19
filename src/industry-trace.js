let traces = {}

// 0 ->
//   1 -> 2
//   3 -> 4

// 0: {
//   args: {},
//   promise: <Promise>,
//   children: [ 1, 3 ]
// }

// 1: {
//   args: {},
//   children: [ 2 ]
// }

// 3: {
//   args: {},
//   children: [ 4 ]
// }

function display(id, level=0) {
  let trace = traces[id]
  let indent = ""
  
  for (let x; x < level; x++) {
    indent += "\t"
  }
  
  console.log(indent, trace.name)

  level++
  
  for (let child of trace.children) {
    display(child, level)
  }

  delete traces[id]
}

function patch(ignore, type) {
  for (let name in this.functions()) {
    if (ignore[type].indexOf(name) == -1) {
      let fn = this[name]
      this[name] = args => {
        let parent_id = args._trace_id
        let id = args._trace_id = Math.random()

        traces[id] = { args, name, children: [] }
        
        let output = fn.bind(this)(args)

        if (parent_id) {
          traces[parent_id].children.push(id)
        } else {
          output.then(value => display(id))
        }

        return output
      }
    }
  }
}

export let trace = Class =>
  class extends Class {
    beforeInit() {
      patch.bind(this)(this.Class.industry().ignore, "instance")
      super.beforeInit()
    }
  }
