import type { Attribute, AttributeStatus } from '@prisma/client';
import type { MouseEvent } from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import FormCheck from 'react-bootstrap/FormCheck';
import Image from 'react-bootstrap/Image';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Row from 'react-bootstrap/Row';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { ErrorLogger } from '../../contexts';
import type { DiceRollEvent } from '../../hooks/useDiceRoll';
import useDiceRoll from '../../hooks/useDiceRoll';
import { clamp } from '../../utils';
import api from '../../utils/api';
import type { DiceConfigCell } from '../../utils/config';
import DiceRollModal from '../Modals/DiceRollModal';
import GeneralDiceRollModal from '../Modals/GeneralDiceRollModal';
import PlayerAvatarModal from '../Modals/PlayerAvatarModal';

const MAX_AVATAR_HEIGHT = 450;
const buttonStyle = { borderRadius: 0 };
const labelStyle = { color: 'white' };

type PlayerAttributeContainerProps = {
	playerAttributes: {
		value: number;
		maxValue: number;
		show: boolean;
		Attribute: Attribute;
	}[];
	playerAttributeStatus: {
		value: boolean;
		AttributeStatus: AttributeStatus;
	}[];
	playerAvatars: {
		link: string | null;
		AttributeStatus: {
			id: number;
			name: string;
		} | null;
	}[];
	attributeDiceConfig: DiceConfigCell;
	npcId?: number;
};

export default function PlayerAttributeContainer(props: PlayerAttributeContainerProps) {
	const [diceRollResultModalProps, onDiceRoll] = useDiceRoll(props.npcId);
	const [playerAttributeStatus, setPlayerStatus] = useState(props.playerAttributeStatus);
	const [notify, setNotify] = useState(false);

	function onStatusChanged(id: number, newValue: boolean) {
		const newPlayerStatus = [...playerAttributeStatus];
		const index = newPlayerStatus.findIndex((stat) => stat.AttributeStatus.id === id);
		newPlayerStatus[index].value = newValue;
		setPlayerStatus(newPlayerStatus);
	}

	return (
		<>
			<Row className='justify-content-center'>
				<PlayerAvatarImage
					statusID={playerAttributeStatus.find((stat) => stat.value)?.AttributeStatus.id}
					rerender={notify}
					playerAvatars={props.playerAvatars}
					onAvatarUpdate={() => setNotify((n) => !n)}
					npcId={props.npcId}
				/>
				<PlayerAvatarDice npcId={props.npcId} />
			</Row>
			{props.playerAttributes.map((attr) => {
				const status = playerAttributeStatus.filter(
					(stat) => stat.AttributeStatus.attribute_id === attr.Attribute.id
				);
				return (
					<PlayerAttributeField
						key={attr.Attribute.id}
						attributeDiceConfig={props.attributeDiceConfig}
						playerAttribute={attr}
						playerStatus={status}
						onStatusChanged={onStatusChanged}
						showDiceRollResult={onDiceRoll}
						visibilityEnabled={attr.Attribute.portrait != null}
						npcId={props.npcId}
					/>
				);
			})}
			<DiceRollModal {...diceRollResultModalProps} />
		</>
	);
}

type PlayerAttributeFieldProps = {
	playerAttribute: {
		value: number;
		maxValue: number;
		show: boolean;
		Attribute: Attribute;
	};
	playerStatus: {
		value: boolean;
		AttributeStatus: {
			id: number;
			name: string;
			attribute_id: number;
		};
	}[];
	onStatusChanged?: (id: number, newValue: boolean) => void;
	attributeDiceConfig: DiceConfigCell;
	showDiceRollResult: DiceRollEvent;
	visibilityEnabled: boolean;
	npcId?: number;
};

function PlayerAttributeField(props: PlayerAttributeFieldProps) {
	const attributeID = props.playerAttribute.Attribute.id;
	const [show, setShow] = useState(props.playerAttribute.show);
	const [value, setValue] = useState(props.playerAttribute.value);
	const [maxValue, setMaxValue] = useState(props.playerAttribute.maxValue);
	const barRef = useRef<HTMLDivElement>(null);
	const timeout = useRef<{ timeout?: NodeJS.Timeout; lastValue: number }>({
		lastValue: value,
	});
	const logError = useContext(ErrorLogger);

	useEffect(() => {
		if (barRef.current === null) return;
		const inner = barRef.current.querySelector('.progress-bar') as HTMLDivElement;
		if (inner) inner.style.backgroundColor = `#${props.playerAttribute.Attribute.color}`;
		else
			console.warn(
				'Could not find .progress-bar inner node inside PlayerAttributeField component.'
			);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [barRef]);

	useEffect(() => {
		if (timeout.current.timeout) clearTimeout(timeout.current.timeout);
	}, [maxValue]);

	function updateValue(coeff: number, ignoreMax?: boolean) {
		let newVal: number;

		if (ignoreMax) {
			newVal = Math.max(0, value + coeff);
		} else {
			if (value < maxValue) newVal = clamp(value + coeff, 0, maxValue);
			else newVal = value;
		}

		if (value === newVal) return;

		setValue(newVal);

		if (timeout.current.timeout) {
			clearTimeout(timeout.current.timeout);
			if (timeout.current.lastValue === newVal) return;
		}

		timeout.current.timeout = setTimeout(
			() =>
				api
					.post('/sheet/player/attribute', {
						id: attributeID,
						value: newVal,
						npcId: props.npcId,
					})
					.catch(logError)
					.finally(() => (timeout.current.lastValue = newVal)),
			750
		);
	}

	function onNewMaxValue() {
		let input = prompt('Digite o novo valor do atributo:', maxValue.toString());

		if (input === null) return;

		const newMaxValue = parseInt(input);

		if (isNaN(newMaxValue) || maxValue === newMaxValue) return;

		setMaxValue(newMaxValue);
		let valueUpdated = false;
		if (value > newMaxValue) {
			setValue(newMaxValue);
			valueUpdated = true;
		}

		api
			.post('/sheet/player/attribute', {
				id: attributeID,
				maxValue: newMaxValue,
				value: valueUpdated ? newMaxValue : undefined,
				npcId: props.npcId,
			})
			.catch(logError);
	}

	function onShowChange(ev: MouseEvent<HTMLButtonElement>) {
		ev.currentTarget.blur();
		setShow((s) => {
			const newShow = !s;
			api
				.post('/sheet/player/attribute', {
					id: attributeID,
					show: newShow,
					npcId: props.npcId,
				})
				.catch(logError);
			return newShow;
		});
	}

	function diceClick(standalone: boolean) {
		const roll = props.attributeDiceConfig.value;
		const branched = props.attributeDiceConfig.branched;
		props.showDiceRollResult({
			dices: { num: standalone ? 1 : undefined, roll, ref: value },
			resolverKey: `${roll}${branched ? 'b' : ''}`,
		});
	}

	return (
		<Row className='mt-3'>
			<Col>
				<Row>
					<Col>
						<label htmlFor={`attribute${attributeID}`}>
							Pontos de {props.playerAttribute.Attribute.name}
						</label>
					</Col>
				</Row>
				<Row className='align-items-start'>
					{props.visibilityEnabled && (
						<Col xs='auto' className='pt-1 pe-0'>
							<Button
								aria-label={show ? 'Esconder' : 'Mostrar'}
								size='sm'
								variant={show ? 'primary' : 'secondary'}
								onClick={onShowChange}>
								{show ? <AiFillEye /> : <AiFillEyeInvisible />}
							</Button>
						</Col>
					)}
					<Col className='progress-container'>
						<ProgressBar
							label={`${value}/${maxValue}`}
							visuallyHidden
							now={value}
							min={0}
							max={maxValue}
							style={{
								backgroundColor: `#${props.playerAttribute.Attribute.color}40`,
							}}
							ref={barRef}
							className='clickable'
							onClick={onNewMaxValue}
						/>
                                                <div className='label h5' style={labelStyle}>{`${value}/${maxValue}`}</div>   
					</Col>
					{props.playerAttribute.Attribute.rollable && (
						<Col xs='auto' style={{ paddingLeft: 0 }}>
							<Image
								src='/dice20.webp'
								alt='Dado'
								className='attribute-dice clickable'
								onClick={(ev) => diceClick(ev.ctrlKey)}
							/>
						</Col>
					)}
				</Row>
				<Row className='justify-content-between mt-1 px-2'>
					<Col xs={6} lg={5} xl={4}>
						<Row>
							<Col xs={6} className='pe-0'>
								<Button
									variant='secondary'
									size='sm'
									style={buttonStyle}
									className='w-100 rounded-start'
									onClick={(ev) => updateValue(-5, true)}>
									-5
								</Button>
							</Col>
							<Col xs={6} className='ps-0'>
								<Button
									variant='secondary'
									size='sm'
									style={buttonStyle}
									className='w-100 rounded-end'
									onClick={(ev) => updateValue(-1, true)}>
									-1
								</Button>
							</Col>
						</Row>
					</Col>
					<Col xs={6} lg={5} xl={4}>
						<Row>
							<Col xs={6} className='pe-0'>
								<Button
									variant='secondary'
									size='sm'
									style={buttonStyle}
									className='w-100 rounded-start'
									onClick={(ev) => updateValue(1, true)}>
									+1
								</Button>
							</Col>
							<Col xs={6} className='ps-0'>
								<Button
									variant='secondary'
									size='sm'
									style={buttonStyle}
									className='w-100 rounded-end'
									onClick={(ev) => updateValue(5)}>
									+5
								</Button>
							</Col>
						</Row>
					</Col>
				</Row>
				<Row className='mt-2'>
					<Col>
						{props.playerStatus.map((stat) => (
							<PlayerAttributeStatusField
								key={stat.AttributeStatus.id}
								playerAttributeStatus={stat}
								onStatusChanged={props.onStatusChanged}
								npcId={props.npcId}
							/>
						))}
					</Col>
				</Row>
			</Col>
		</Row>
	);
}

type PlayerAttributeStatusFieldProps = {
	playerAttributeStatus: {
		value: boolean;
		AttributeStatus: {
			id: number;
			name: string;
			attribute_id: number;
		};
	};
	onStatusChanged?: (id: number, newValue: boolean) => void;
	npcId?: number;
};

function PlayerAttributeStatusField({
	playerAttributeStatus,
	onStatusChanged,
	npcId,
}: PlayerAttributeStatusFieldProps) {
	const id = playerAttributeStatus.AttributeStatus.id;
	const attrID = playerAttributeStatus.AttributeStatus.attribute_id;
	const name = playerAttributeStatus.AttributeStatus.name;
	const logError = useContext(ErrorLogger);
	const [checked, setChecked] = useState(playerAttributeStatus.value);

	function changeValue() {
		const value = !checked;
		setChecked(value);
		api
			.post('/sheet/player/attribute/status', { attrStatusID: id, value, npcId })
			.then(() => {
				if (onStatusChanged) onStatusChanged(id, value);
			})
			.catch((err) => {
				logError(err);
				setChecked(checked);
			});
	}

	return (
		<FormCheck
			inline
			checked={checked}
			onChange={changeValue}
			id={`spec${id}${attrID}`}
			label={name}
		/>
	);
}

type PlayerAvatarImageProps = {
	statusID?: number;
	rerender: boolean;
	onAvatarUpdate?: () => void;
	playerAvatars: {
		link: string | null;
		AttributeStatus: {
			id: number;
			name: string;
		} | null;
	}[];
	npcId?: number;
};

function PlayerAvatarImage(props: PlayerAvatarImageProps) {
	const statusID = props.statusID || 0;

	const [src, setSrc] = useState('#');
	const [avatarModalShow, setAvatarModalShow] = useState(false);
	const previousStatusID = useRef(statusID);

	useEffect(() => {
		api
			.get(`/sheet/player/avatar/${statusID}`, { params: { playerID: props.npcId } })
			.then((res) => setSrc(res.data.link))
			.catch(() => setSrc('/avatar404.png'));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.rerender]);

	useEffect(() => {
		if (statusID === previousStatusID.current) return;
		previousStatusID.current = statusID;
		api
			.get(`/sheet/player/avatar/${statusID}`, { params: { playerID: props.npcId } })
			.then((res) => setSrc(res.data.link))
			.catch(() => setSrc('/avatar404.png'));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.statusID]);

	return (
		<>
			<Col xl={{ offset: 2 }} className='text-center'>
				<Image
					fluid
					src={src}
					alt='Avatar'
					className='clickable'
					style={{ maxHeight: MAX_AVATAR_HEIGHT }}
					onError={() => setSrc('/avatar404.png')}
					onClick={() => setAvatarModalShow(true)}
				/>
			</Col>
			<PlayerAvatarModal
				playerAvatars={props.playerAvatars}
				show={avatarModalShow}
				onHide={() => setAvatarModalShow(false)}
				onUpdate={props.onAvatarUpdate}
				npcId={props.npcId}
			/>
		</>
	);
}

function PlayerAvatarDice(props: { npcId?: number }) {
	const [generalDiceRollShow, setGeneralDiceRollShow] = useState(false);

	return (
		<>
			<Col xs={4} md={3} xl={2} className='align-self-center'>
				<Image
					fluid
					src='/dice20.webp'
					alt='Dado Geral'
					className='clickable'
					onClick={() => setGeneralDiceRollShow(true)}
				/>
			</Col>
			<GeneralDiceRollModal
				show={generalDiceRollShow}
				onHide={() => setGeneralDiceRollShow(false)}
				npcId={props.npcId}
			/>
		</>
	);
}
