let utils = require('../../../lib/utils')
let html = require('./cyclicCategoryEncoders.tmpl.html')
let CyclicCategoryEncoderDisplay = require('CyclicCategoryEncoderDisplay')
let CyclicCategoryEncoder = require('CyclicCategoryEncoder')

module.exports = (elementId) => {

    utils.loadHtml(html.default, elementId, () => {
        let size = 135

        let params = [{
            // day of week
            buckets: 7,
            range: 9,
            bits: 21,
            color: 'red',
        }, {
            // day of month
            buckets: 31,
            range: 9,
            bits: 21,
            color: 'green',
        }, {
            // weekend
            buckets: 2,
            range: 11,
            bits: 21,
            color: 'yellow',
        }, {
            // time of day
            buckets: 23,
            range: 9,
            bits: 21,
            color: 'blue',
        }]

        let names = [
            'season',
            'day-of-month',
            'weekend',
            'time-of-day'
        ]

        let displays = names.map((name, i) => {
            let prms = params[i]
            let encoder = new CyclicCategoryEncoder(prms)
            prms.size = size
            let encoderDisplay = new CyclicCategoryEncoderDisplay(name, encoder, prms)
            encoderDisplay.render()
            return encoderDisplay
        })

        displays[0].jsds.set('value', 0)
        displays[1].jsds.set('value', 0)
        displays[2].jsds.set('value', 0)
        displays[3].jsds.set('value', 0)

        displays[0].loop()
        displays[1].loop()
        displays[2].loop()
        displays[3].loop()

    })

}
