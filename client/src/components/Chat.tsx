import { Accessor, Component, For, JSX, Setter, createEffect, createSignal, on, onCleanup, onMount } from 'solid-js';
import { UnlistenFn, emit, listen } from '@tauri-apps/api/event';
import { ReqLogin, Request, ResError, ResMsg } from '../types';

const Chat: Component<{ data: Accessor<ReqLogin>; setError: Setter<ResError>; setJoined: Setter<boolean> }> = ({
	data,
	setError,
	setJoined,
}) => {
	const [messages, setMessages] = createSignal<ResMsg[]>([]);
	const [msg, setMsg] = createSignal('');

	let chat: HTMLDivElement | undefined;

	// prettier-ignore
	const colors: { [key: string]: string } = {
		red: 		'text-red-400',
		green: 		'text-green-400',
		yellow: 	'text-yellow-400',
		blue: 		'text-blue-400',
		fuchsia: 	'text-fuchsia-400',
		cyan: 		'text-cyan-400',
	};

	onMount(async () => {
		await listen('SRV_MSG', (e: any) => {
			if (e.payload.kind) {
				setError(e.payload);
				setJoined(false);
			}
			setMessages(p => [...p, e.payload]);
		}).catch(e => setError({ kind: 'LISTENER', msg: e }));
	});

	createEffect(
		on(messages, () => {
			chat!.scrollTop = chat!.scrollHeight - chat!.clientHeight;
		})
	);

	return (
		<div class='flex flex-col justify-around w-full min-h-0 h-full px-4 pb-4 relative'>
			<div ref={chat} class='flex grow flex-col gap-y-2 overflow-y-auto text-slate-900 relative'>
				<For each={messages()}>
					{(msg, i) => (
						<div class='flex gap-x-4 select-auto first:mt-4'>
							<p class='text-slate-600 dark:text-slate-400'>
								{new Date().toLocaleDateString(undefined, {
									hour: '2-digit',
									minute: '2-digit',
								})}
							</p>
							<b class={`${colors[msg.color]}`}>{msg.user}</b>
							<p class='dark:text-slate-50'>{msg.msg}</p>
						</div>
					)}
				</For>
			</div>
			<div class='mt-4'>
				<input
					value={msg()}
					onInput={e => {
						setMsg(e.target.value);
					}}
					onKeyPress={e => {
						if (e.key == 'Enter' && msg().length) {
							emit('CLI_MSG', { op: 'MSG', data: msg() } as Request).catch(err => setError(err.data));
							setMsg('');
						}
					}}
					class='px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-600 outline-none w-full placeholder-gray-600 dark:placeholder-slate-400 dark:text-slate-200 focus:shadow-md ease-in-out duration-200'
					type='text'
					placeholder='Type a message...'
				/>
			</div>
		</div>
	);
};

export default Chat;
