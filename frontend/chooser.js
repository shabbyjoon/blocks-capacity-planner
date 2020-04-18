import {
	Box,
	Button,
	FormField,
	ProgressBar,
	Select,
	loadCSSFromString,
} from '@airtable/blocks/ui';
import {base} from '@airtable/blocks';
import React, {useCallback, useState} from 'react';

import buildShifts from './build-shifts';
import fillOrders from './fill-orders';
import Shift from './shift';

const containerStyle = {
	position: 'absolute',
	top: 0,
	right: 0,
	bottom: 0,
	left: 0,

	display: 'flex',
};

const sampleDates = [
	'2020-04-19',
	'2020-04-20',
	'2020-04-21',
	'2020-04-22',
	'2020-04-23',
	'2020-04-24',
	'2020-04-25',
];

const hospitals = [
	{
		name: 'Mass General Hospital',
		need: 50,
		times: [
			{day: 'Monday', time: '19:00'},
			{day: 'Monday', time: '19:00'},
			{day: 'Tuesday', time: '19:00'},
			{day: 'Tuesday', time: '19:00'},
			{day: 'Wednesday', time: '19:00'},
			{day: 'Wednesday', time: '19:00'},
			{day: 'Thursday', time: '19:00'},
			{day: 'Thursday', time: '19:00'},
			{day: 'Friday', time: '19:00'},
			{day: 'Friday', time: '19:00'},
		]
	},
	{
		name: 'South Shore Hospital',
		need: 30,
		times: [
			{day: 'Sunday', time: '13:00'},
			{day: 'Monday', time: '13:00'},
			{day: 'Tuesday', time: '13:00'},
			{day: 'Wednesday', time: '13:00'},
			{day: 'Thursday', time: '13:00'},
			{day: 'Friday', time: '13:00'},
			{day: 'Saturday', time: '13:00'},
		]
	},
	{
		name: 'Brigham and Women\'s',
		need: 40,
		times: [
			{day: 'Sunday', time: '13:00'},
			{day: 'Sunday', time: '20:00'},
			{day: 'Saturday', time: '13:00'},
			{day: 'Saturday', time: '20:00'},
		]
	},
].map((hospital, id) => Object.assign(hospital, {id}));

const restaurants = [
	{
		name: 'Gio\'s',
		capacity: 20,
		price: 10,
		times: [
			{day: 'Sunday', timeOfDay: 'afternoon'},
			{day: 'Sunday', timeOfDay: 'evening'},
			{day: 'Monday', timeOfDay: 'afternoon'},
			{day: 'Monday', timeOfDay: 'evening'},
			{day: 'Tuesday', timeOfDay: 'afternoon'},
			{day: 'Tuesday', timeOfDay: 'evening'},
			{day: 'Wednesday', timeOfDay: 'afternoon'},
			{day: 'Wednesday', timeOfDay: 'evening'},
			{day: 'Thursday', timeOfDay: 'afternoon'},
			{day: 'Thursday', timeOfDay: 'evening'},
			{day: 'Friday', timeOfDay: 'afternoon'},
			{day: 'Friday', timeOfDay: 'evening'},
			{day: 'Saturday', timeOfDay: 'afternoon'},
			{day: 'Saturday', timeOfDay: 'evening'},
		],
	},
	{
		name: 'The Lobster Stop',
		capacity: 20,
		price: 35,
		times: [
			{day: 'Monday', timeOfDay: 'afternoon'},
			{day: 'Monday', timeOfDay: 'evening'},
			{day: 'Tuesday', timeOfDay: 'afternoon'},
			{day: 'Tuesday', timeOfDay: 'evening'},
			{day: 'Wednesday', timeOfDay: 'afternoon'},
			{day: 'Wednesday', timeOfDay: 'evening'},
			{day: 'Thursday', timeOfDay: 'afternoon'},
			{day: 'Thursday', timeOfDay: 'evening'},
			{day: 'Friday', timeOfDay: 'afternoon'},
			{day: 'Friday', timeOfDay: 'evening'},
			{day: 'Saturday', timeOfDay: 'afternoon'},
			{day: 'Saturday', timeOfDay: 'evening'},
		],
	},
	{
		name: 'Denley\'s',
		capacity: 50,
		price: 10,
		times: [
			{day: 'Monday', timeOfDay: 'afternoon'},
			{day: 'Monday', timeOfDay: 'evening'},
			{day: 'Tuesday', timeOfDay: 'afternoon'},
			{day: 'Tuesday', timeOfDay: 'evening'},
			{day: 'Wednesday', timeOfDay: 'afternoon'},
			{day: 'Wednesday', timeOfDay: 'evening'},
			{day: 'Thursday', timeOfDay: 'afternoon'},
			{day: 'Thursday', timeOfDay: 'evening'},
			{day: 'Friday', timeOfDay: 'afternoon'},
			{day: 'Friday', timeOfDay: 'evening'},
			{day: 'Saturday', timeOfDay: 'afternoon'},
			{day: 'Saturday', timeOfDay: 'evening'},
		],
	},
	{
		name: 'Little Duck',
		capacity: 20,
		price: 15,
		times: [
			{day: 'Sunday', timeOfDay: 'evening'},
			{day: 'Monday', timeOfDay: 'evening'},
			{day: 'Tuesday', timeOfDay: 'evening'},
			{day: 'Wednesday', timeOfDay: 'evening'},
			{day: 'Thursday', timeOfDay: 'evening'},
			{day: 'Friday', timeOfDay: 'evening'},
			{day: 'Saturday', timeOfDay: 'evening'},
		],
	},
	{
		name: 'The Fat Cat',
		capacity: 30,
		price: 25,
		times: [
			{day: 'Monday', timeOfDay: 'evening'},
			{day: 'Tuesday', timeOfDay: 'evening'},
			{day: 'Wednesday', timeOfDay: 'evening'},
			{day: 'Thursday', timeOfDay: 'evening'},
			{day: 'Friday', timeOfDay: 'evening'},
			{day: 'Saturday', timeOfDay: 'evening'},
		],
	},
	{
		name: 'The Four\'s',
		capacity: 70,
		price: 20,
		times: [
			{day: 'Sunday', timeOfDay: 'evening'},
			{day: 'Monday', timeOfDay: 'evening'},
			{day: 'Tuesday', timeOfDay: 'evening'},
			{day: 'Wednesday', timeOfDay: 'evening'},
			{day: 'Thursday', timeOfDay: 'evening'},
			{day: 'Friday', timeOfDay: 'evening'},
			{day: 'Saturday', timeOfDay: 'evening'},
		],
	},
].map((restaurant, id) => Object.assign(restaurant, {id}));

loadCSSFromString(`
	.clearfix:after {
		content: "\\00A0";
		display: block;
		clear: both;
		visibility: hidden;
		line-height: 0;
		height: 0;
	}
	.clearfix {display: block}
`);

function annotateExtremes(collection, propertyName) {
	const all = collection.map((item) => item[propertyName]);
	const extremes = {
		[`max${propertyName}`]: Math.max(...all),
		[`min${propertyName}`]: Math.min(...all),
	};
	return collection.map((item) => Object.assign({}, item, extremes));
}

const sortOptions = [
	{value: 'name', label: 'Name'},
	{value: 'capacity', label: 'Capacity'},
	{value: 'price', label: 'Price'}
];

const producerStats = [
	{value: null, label: 'none'},
	{value: 'capacity', label: 'Capacity'},
	{value: 'price', label: 'Price'}
];

const purchaseStrategies = [
	{value: 'cheap', label: 'Cheap'},
	{value: 'fair', label: 'Fair'}
];

function useAssignments(initial) {
	const [assignments, setAssignments] = useState(Object.freeze(initial));
	const assign = (date, consumerId, producerId) => {
		const newAssignments = assignments
			.filter((assignment) => {
				return !(
					assignment.date === date &&
					assignment.producerId === producerId
				);
			});

		if (consumerId !== null) {
			newAssignments.push({date, consumerId, producerId});
		}

		setAssignments(Object.freeze(newAssignments));
	};

	return [assignments, assign];
}

export default function Chooser({producers, consumers, dates}) {
	producers = restaurants;
	consumers = hospitals;
	dates = sampleDates;

	consumers = annotateExtremes(consumers, 'need');
	producers = annotateExtremes(producers, 'capacity');
	producers = annotateExtremes(producers, 'price');
	const windows = dates.map((date) => [
		{date, timeOfDay: 'afternoon'}, {date, timeOfDay: 'evening'}
	]).flat();

	const [sort, setSort] = useState('name');
	const [producerStat, setProducerStat] = useState(null);
	const [strategy, setStrategy] = useState('cheap');
	const [assignments, assign] = useAssignments([]);

	const budget = 1000;
	const cost = fillOrders({strategy, assignments, producers, consumers})
		.reduce((total, order) => {
			const producer = producers.find(({id}) => id === order.producerId);
			return total + producer.price * order.quantity;
		}, 0);

	const barColor = cost / budget <= 1 ? '#32a852' : '#a00';

	const shifts = buildShifts(windows, producers, consumers);

	return (
		<Box style={{flexDirection: 'column', ...containerStyle}}>
			<Box padding={2} style={{overflowY: 'scroll'}}>
				{shifts.map(({window, producers, consumers}) => (
					<Shift key={window.date + window.timeOfDay}
						date={`${window.date} ${window.timeOfDay}`}
						producers={producers}
						consumers={consumers}
						producerStat={producerStat}
						onAssign={assign} />
				))}
			</Box>

			<Box padding={3} display="flex" alignItems="right">
				<Box paddingRight={3}>
					<FormField label="Sort producers">
						<Select disabled={true} options={sortOptions} value={sort} onChange={setSort} />
					</FormField>
				</Box>

				<Box paddingRight={3}>
					<FormField label="Producer statistic">
						<Select options={producerStats} value={producerStat} onChange={setProducerStat} />
					</FormField>
				</Box>

				<Box paddingRight={3}>
					<FormField label="Purchase strategy">
						<Select options={purchaseStrategies} value={strategy} onChange={setStrategy} />
					</FormField>
				</Box>

				<Box flexGrow={1} paddingRight={3}>
					<ProgressBar progress={cost/1000} barColor={barColor} style={{height: '1em'}} />
					Budget: ${cost} of $1000
				</Box>

				<Button icon="thumbsUp" variant="primary" disabled={true}>
					Apply Schedule
				</Button>
			</Box>
		</Box>
	);
};
