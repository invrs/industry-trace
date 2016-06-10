let traces = {}

function display(id, level=0, string="") {
  let trace = traces[id]
  let indent = ""
  
  for (let x = 1; x < level; x++) {
    indent += "  "
  }
  
  if (level > 0) {
    indent += "-> "
  }

  string += `${indent}${trace.name}\n`
  level++
  
  for (let child of trace.children) {
    string = display(child, level, string)
  }

  delete traces[id]

  return string
}

function getTraceID(args) {
  let trace_id
  args.forEach(arg => {
    if (arg && arg._trace_id) trace_id = arg._trace_id
  })
  return trace_id
}

function patch(ignore, type) {
  for (let name in this.functions()) {
    if (ignore[type].indexOf(name) == -1) {
      let fn = this[name]
      this[name] = (...args) =>
        runAndReturn({ args, bind_to: this, fn, name })
    }
  }
}

function runAndReturn({ args, bind_to, fn, name }) {
  let parent_id = getTraceID(args)
  let id = Math.random()

  args.push({ _trace_id: id })
  traces[id] = { name, children: [] }
  
  let output = fn.bind(bind_to)(...args)
  delete output._trace_id

  if (parent_id) {
    traces[parent_id].children.push(id)
  } else {
    output.then(value => console.log(display(id)))
  }

  return output
}

export let trace = Class =>
  class extends Class {
    beforeInit() {
      patch.bind(this)(this.Class.industry().ignore, "instance")
      super.beforeInit()
    }
  }
