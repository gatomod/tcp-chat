import { Accessor, Component, Setter, Show } from 'solid-js';

import { ReqLogin, ResError } from '../types';

import Checkmark from '../assets/Checkmark';
import Prohibited from '../assets/Prohibited';

const Color: Component<{
	data: Accessor<ReqLogin>;
	setData: Setter<ReqLogin>;
	color: string;
	border: string;
	fill: string;
	bg: string;
}> = ({ data, setData, color, border, fill, bg }) => {
	return (
		<div
			onClick={() => setData({ ...data(), color: data().color == color ? '' : color })}
			class={`w-16 h-16 rounded-full flex justify-center items-center ${
				data().color == color && 'border-4'
			} ${border} ${bg} shadow-md hover:-translate-y-1 active:shadow-md active:translate-y-0 ease-in-out duration-200`}>
			<Show when={data().color == color}>
				<Checkmark class={`w-9 h-9 ${fill}`} />
			</Show>
		</div>
	);
};

const Login: Component<{
	err: Accessor<ResError>;
	data: Accessor<ReqLogin>;
	setData: Setter<ReqLogin>;
}> = ({ data, setData }) => {
	return (
		<div class='flex flex-col p-4 w-full gap-y-4'>
			<div class='flex gap-x-4'>
				<input
					value={data().addr}
					onInput={e => setData({ ...data(), addr: e.target.value })}
					class='px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-600 outline-none w-full placeholder-gray-600 dark:placeholder-slate-400 dark:text-slate-200 focus:shadow-md ease-in-out duration-200'
					type='text'
					placeholder='Server address'
				/>
				<input
					value={data().name}
					onInput={e => setData({ ...data(), name: e.target.value })}
					class='px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-600 outline-none w-full placeholder-gray-600 dark:placeholder-slate-400 dark:text-slate-200 focus:shadow-md ease-in-out duration-200'
					type='text'
					placeholder='Name'
				/>
			</div>
			<div class='flex flex-col gap-y-4'>
				<p class='text-slate-700 dark:text-slate-300'>
					<b>Color:</b> {data().color || 'default'}
				</p>
				<div class='flex flex-wrap justify-evenly gap-4'>
					<div
						onClick={() => setData({ ...data(), color: '' })}
						class={`w-16 h-16 rounded-full flex justify-center items-center ${
							data().color == '' && 'border-4'
						} border-lime-200 bg-lime-600 dark:bg-lime-700 shadow-md hover:-translate-y-1 active:shadow-md active:translate-y-0 ease-in-out duration-200`}>
						<Show when={data().color == ''}>
							<Prohibited class='w-9 h-9 fill-lime-200' />
						</Show>
					</div>
					<Color
						data={data}
						setData={setData}
						color='red'
						bg='bg-red-400'
						border='border-red-200'
						fill='fill-red-200 dark:fill-red-800'
					/>
					<Color
						data={data}
						setData={setData}
						color='green'
						bg='bg-green-400'
						border='border-green-200'
						fill='fill-green-200 dark:fill-green-800'
					/>
					<Color
						data={data}
						setData={setData}
						color='yellow'
						bg='bg-yellow-400'
						border='border-yellow-200'
						fill='fill-yellow-200 dark:fill-yellow-800'
					/>
					<Color
						data={data}
						setData={setData}
						color='blue'
						bg='bg-blue-400'
						border='border-blue-200'
						fill='fill-blue-200 dark:fill-blue-800'
					/>
					<Color
						data={data}
						setData={setData}
						color='fuchsia'
						bg='bg-fuchsia-400'
						border='border-fuchsia-200'
						fill='fill-fuchsia-200 dark:fill-fuchsia-800'
					/>

					<Color
						data={data}
						setData={setData}
						color='cyan'
						bg='bg-cyan-400'
						border='border-cyan-200'
						fill='fill-cyan-200 dark:fill-cyan-800'
					/>
				</div>
			</div>
		</div>
	);
};

export default Login;
