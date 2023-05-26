import { Show, createEffect, createSignal } from 'solid-js';
import { emit } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api';

import { ReqLogin, ResError, Request } from './types';
import Login from './components/Login';
import Button from './components/Button';
import Chat from './components/Chat';

import Dismiss from './assets/Dimiss';
import Moon from './assets/Moon';
import Sun from './assets/Sun';
import Info from './assets/Info';

function App() {
	const [joined, setJoined] = createSignal(false);

	const [data, setData] = createSignal<ReqLogin>({ color: '', name: '', addr: '' });
	const [error, setError] = createSignal<ResError>({ kind: '', msg: '' });
	const [dark, setDark] = createSignal(false);

	createEffect(() => {
		let ddc = document.documentElement.classList;
		dark() ? ddc.add('dark') : ddc.remove('dark');
	});

	return (
		<div class='w-full h-screen flex flex-col select-none dark:bg-gray-800'>
			<div class='flex px-8 py-2 items-center justify-between bg-lime-600 dark:bg-lime-700 text-slate-50 shadow-md shadow-slate-300/50 dark:shadow-slate-700/50'>
				<p class='font-semibold text-xl'>TCP Chat</p>
				<div class='flex items-center gap-x-4'>
					<Show when={joined()}>
						<p>
							Joined <b>{data().addr}</b> as <b>{data().name}</b>
						</p>
					</Show>

					<div
						class='flex justify-center items-center w-12 h-12 p-2 rounded-md hover:bg-lime-500 active:bg-lime-700 dark:hover:bg-lime-600 dark:active:bg-lime-800 ease-in-out duration-200'
						onClick={() =>
							alert(
								[
									'Simple, quick and lightweight chat built over TCP and Rust.',
									'Copyright Gátomo 2023',
									'Licensed under the GNU General Public License v.3.0.',
									'This program comes with ABSOLUTELY NO WARRANTY.',
								].join('\n')
							)
						}>
						<Info class='w-10 h-10 fill-slate-100' />
					</div>

					<div
						class='flex justify-center items-center w-12 h-12 p-2 rounded-md hover:bg-lime-500 active:bg-lime-700 dark:hover:bg-lime-600 dark:active:bg-lime-800 ease-in-out duration-200'
						onClick={() => setDark(p => !p)}>
						<Show when={dark()} fallback={<Moon class='w-10 h-10 fill-slate-100' />}>
							<Sun class='w-10 h-10 fill-slate-100' />
						</Show>
					</div>

					<Show
						when={!joined()}
						fallback={
							<Button
								onClick={async () => {
									setJoined(false);
									await emit('CLI_LEAVE').catch(() => null);
								}}>
								Leave
							</Button>
						}>
						<Button
							onClick={async () => {
								if (!data().name || !data().addr) {
									setError({ kind: 'CLI_DATA', msg: 'missing data' });
									return;
								}

								try {
									let init = invoke('connect', { reqData: { op: 'LOGIN', data: data() } as Request });

									setJoined(true);
									setError({ kind: '', msg: '' });

									await init;
								} catch (error: any) {
									setJoined(false);
									setError({ kind: error.data.kind, msg: error.data.msg });
								}
							}}>
							Join
						</Button>
					</Show>
				</div>
			</div>
			<Show when={error().kind}>
				<div class='flex px-8 py-2 items-center gap-x-4 bg-red-400 dark:bg-red-500 text-slate-50 shadow-md shadow-slate-300/50 dark:shadow-slate-700/50 ease-in-out duration-200 transition-all'>
					<Dismiss onClick={() => setError({ kind: '', msg: '' })} class='fill-slate-100 w-6 h-6' />
					<p>
						<b>Error:</b> {error().msg}.{' ' /* Prettier put that string xd */}
						<a onClick={() => setError({ kind: '', msg: '' })} class='underline cursor-pointer'>
							Dimiss
						</a>
					</p>
				</div>
			</Show>
			<Show when={joined()} fallback={<Login err={error} data={data} setData={setData} />}>
				<Chat data={data} setError={setError} setJoined={setJoined} />
			</Show>
		</div>
	);
}

export default App;
