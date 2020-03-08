const mongoose = require('mongoose');
const findOneOrCreate = require('mongoose-findoneorcreate');
const bcrypt = require('mongoose-bcrypt');
const timestamps = require('mongoose-timestamp');

const UserSchema = new mongoose.Schema(
	{
	    username: {
		    type: String,
			trim: true,
			required: true,
		},
		password: {
			type: String,
			required: true,
			bcrypt: true,
		},
	},
	{
		collection: 'users',
	}
);

UserSchema.plugin(findOneOrCreate);
UserSchema.plugin(bcrypt);
UserSchema.plugin(timestamps);

UserSchema.index({ createdAt: 1, updatedAt: 1 });

module.exports = mongoose.model('User', UserSchema);
