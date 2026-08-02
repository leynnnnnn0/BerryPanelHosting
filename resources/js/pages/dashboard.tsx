import { Head, useForm } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { Button } from '@/components/ui/button';
import { GitBranch } from 'lucide-react';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function Dashboard() {
    const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState<boolean>(false);
    const items = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
    ];

    const {data, setData, post} = useForm({
        'project_name': '',
        'github_url': '',
        'is_dockerized': 'no',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        console.log(data)
        e.preventDefault();
        post('/deploy', {
            onSuccess: (res) => {
                console.log(res)
            },
            onError: (err) => {
                console.log(err)
            }
        })
    }
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Good morning, Peter!
                </h1>

                <Dialog
                    open={isNewProjectDialogOpen}
                    onOpenChange={setIsNewProjectDialogOpen}
                >
                    <form>
                        <DialogTrigger asChild>
                            <Button
                                onClick={() => setIsNewProjectDialogOpen(true)}
                                variant="outline"
                                className="cursor-pointer"
                            >
                                <GitBranch data-icon="inline-start" /> New
                                Deployment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                            <DialogHeader className="border-b pb-5">
                                <DialogTitle className="text-xs font-light">
                                    New Deployment
                                </DialogTitle>
                                <DialogDescription className="text-2xl font-bold text-black">
                                    Connect a GitHub repository and BerryPanel
                                    will prepare the application workspace.
                                </DialogDescription>
                            </DialogHeader>
                            <FieldGroup className="grid grid-cols-2 gap-5">
                                <Field className='col-span-2'>
                                    <Label htmlFor="github-url">
                                        Github Repository
                                    </Label>
                                    <Input
                                        id="github-url"
                                        name="github_url"
                                        placeholder="https:://github.com/facebook/react"
                                        value={data.github_url}
                                        onChange={(e) => setData('github_url', e.target.value)}
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="project-name">
                                        Project Name
                                    </Label>
                                    <Input
                                        id="project-name"
                                        name="project_name"
                                        placeholder="facebook"
                                        value={data.project_name}
                                        onChange={(e) => setData('project_name', e.target.value)}
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="is-dockerized">
                                        Is your project already dockerized?
                                    </Label>
                                    <Select items={items} value={data.is_dockerized} onValueChange={(value) => setData('is_dockerized', value)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {items.map((item) => (
                                                    <SelectItem
                                                        key={item.value}
                                                        value={item.value}
                                                    >
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            </FieldGroup>
                            <DialogFooter>
                                <DialogClose
                                    render={
                                        <Button variant="outline">
                                            Cancel
                                        </Button>
                                    }
                                />
                                <Button type="submit" className='w-full' onClick={(e) => handleSubmit(e)}>
                                    Deploy
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </form>
                </Dialog>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
