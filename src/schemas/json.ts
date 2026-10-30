export const SwimSessionJsonSchema = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	$type: 'object',
	required: ['type', 'metadata', 'phases'],
	properties: {
		type: { const: 'swimsession' },
		metadata: { $ref: '#/definitions/SessionMetadata' },
		config: { $ref: '#/definitions/SwimConfig' },
		phases: {
			type: 'array',
			items: { $ref: '#/definitions/SwimPhase' },
		},
	},
	definitions: {
		SessionMetadata: {
			type: 'object',
			required: ['id'],
			properties: {
				id: { type: 'string' },
				name: { type: 'string' },
				date: { type: 'string' },
				description: { type: 'string' },
				athlete: { type: 'string' },
				coach: { type: 'string' },
				notes: { type: 'string' },
				version: { type: 'string' },
			},
		},
		Distance: {
			type: 'object',
			properties: {
				meters: { type: 'number' },
				yards: { type: 'number' },
				kilometers: { type: 'number' },
				miles: { type: 'number' },
			},
		},
		Duration: {
			type: 'object',
			properties: {
				seconds: { type: 'number' },
				minutes: { type: 'number' },
				hours: { type: 'number' },
			},
		},
		Intensity: {
			type: 'object',
			properties: {
				rpe: { type: 'number', minimum: 1, maximum: 10 },
				hr: { type: 'number' },
				power: { type: 'number' },
				ftpPct: { type: 'number' },
				pace: { type: 'string' },
			},
		},
		Equipment: {
			type: 'object',
			properties: {
				paddles: { type: 'boolean' },
				fins: { type: 'boolean' },
				snorkel: { type: 'boolean' },
				pullbuoy: { type: 'boolean' },
				kickboard: { type: 'boolean' },
				bands: { type: 'boolean' },
			},
		},
		SwimConfig: {
			type: 'object',
			properties: {
				pool: {
					type: 'object',
					properties: {
						lengthMeters: { type: 'number' },
						lengthYards: { type: 'number' },
						laneWidthMeters: { type: 'number' },
						depthMeters: { type: 'number' },
						indoor: { type: 'boolean' },
					},
				},
				gear: { $ref: '#/definitions/Equipment' },
			},
		},
		SwimPhase: {
			type: 'object',
			required: ['name', 'activities'],
			properties: {
				name: { enum: ['presession', 'warmup', 'main', 'cooldown', 'postsession'] },
				activities: { type: 'array' },
			},
		},
	},
};

export const RunSessionJsonSchema = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	$type: 'object',
	required: ['type', 'metadata', 'phases'],
	properties: {
		type: { const: 'runsession' },
		metadata: { $ref: '#/definitions/SessionMetadata' },
		config: { type: 'object' },
		phases: { type: 'array' },
	},
	definitions: {
		SessionMetadata: {
			type: 'object',
			required: ['id'],
			properties: {
				id: { type: 'string' },
				name: { type: 'string' },
				date: { type: 'string' },
			},
		},
	},
};

export const BikeSessionJsonSchema = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	$type: 'object',
	required: ['type', 'metadata', 'phases'],
	properties: {
		type: { const: 'bikesession' },
		metadata: { $ref: '#/definitions/SessionMetadata' },
		config: { type: 'object' },
		phases: { type: 'array' },
	},
	definitions: {
		SessionMetadata: {
			type: 'object',
			required: ['id'],
			properties: {
				id: { type: 'string' },
				name: { type: 'string' },
				date: { type: 'string' },
			},
		},
	},
};

export const DTIRTrainingJsonSchema = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	$type: 'object',
	required: ['id', 'metadata', 'sport', 'session'],
	properties: {
		id: { type: 'string' },
		sport: { enum: ['swim', 'run', 'bike'] },
		metadata: { $ref: '#/definitions/SessionMetadata' },
		session: { type: 'object' },
	},
	definitions: {
		SessionMetadata: {
			type: 'object',
			required: ['id'],
			properties: {
				id: { type: 'string' },
				name: { type: 'string' },
			},
		},
	},
};

export function getJsonSchema(type: 'dsml' | 'drml' | 'dcml' | 'dtir') {
	if (type === 'dsml') return SwimSessionJsonSchema;
	if (type === 'drml') return RunSessionJsonSchema;
	if (type === 'dcml') return BikeSessionJsonSchema;
	if (type === 'dtir') return DTIRTrainingJsonSchema;
	throw new Error('Unknown type');
}

export default {
	SwimSessionJsonSchema,
	RunSessionJsonSchema,
	BikeSessionJsonSchema,
	DTIRTrainingJsonSchema,
	getJsonSchema,
};
