'use strict'

// Local
const mutil = require('../../lib/mutil'),
	AbstractTask = require('./AbstractTask')

module.exports =
class WorkDirectoryTask extends AbstractTask {
	run() {
		let workDirectory = this.fileMapper_.genomeRootPath()
		return mutil.mkdir(workDirectory)
		.then((result) => {
			if (result.created)
				this.logger_.info({workDirectory}, 'Created work directory')
			this.context_.workDirectory = workDirectory
			this.logger_.info({workDirectory}, 'Set work directory')
		})
	}
}
