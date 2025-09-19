import Link from 'next/link';
import Image from 'next/image';
import logoImg from '@/assets/eye-icon.png'
import classes from './main-header.module.css'

export default function MainHeader() {
    return (
        <header className={classes.header}>
            <Link href="/">
                <Image className={classes.logo} src={logoImg} alt="Logo" />
            </Link>
            <nav className={classes.nav}>
                <ul>
                    <li>
                        <Link href="/dead-library">
                            <p>Dead Library</p>
                        </Link>
                    </li>
                    <li>
                        <Link href="/random">
                            <p>Choose for Me</p>
                        </Link>
                    </li>
                    <li>
                        <Link href="/guidelines">
                            <p>Guidelines</p>
                        </Link>
                    </li>
                    <li>
                        <Link href="/about">
                            <p>About</p>
                        </Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
}