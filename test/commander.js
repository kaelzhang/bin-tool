const {Command} = require('..')

const {
  type,
  argv
} = JSON.parse(process.argv[2])

const C = require(`./${type}`)(Command)

new C(argv).start()
