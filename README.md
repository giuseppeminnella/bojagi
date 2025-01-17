# Bojagi - Review the design of your UI components at ease ✅

![Bojagi Logo](https://otomiqaot7.execute-api.us-east-1.amazonaws.com/dev/logo.svg?height=140)

[Documentation](https://bojagi.io/docs) ◆ [Bojagi Website](https://bojagi.io) ◆ [Apply for closed beta](https://bojagi.io/#early-access)

## 💁‍♀️ What is Bojagi?

Bojagi is a service to review your UI changes visually. We are connected to your repository on GitHub and render 
your components in real time. This way your teammates or designer can review the visual changes and play around
with your component. It's like hosting your Storybook, but more interactive.

Bojagi is currently in closed beta, [apply here!](https://bojagi.io/#early-access)

## 🏆 Why use Bojagi?

Bojagi reduces your development cycle times by removing the back and forth of reviewing your UI designs on your
development environment. 

* No more waiting until you deployed to dev or staging, do it before you merge to master! 🏃‍♀️
* Reduce communication effort: write comments, mark proposed changes visually and quickly give feedback 🚦
* Present your components to peers and customers without the need to click though your whole app 👩‍🎨
* See review feedback directly in GitHub 🤓

## 🤷‍♀️ How does it work?

![Demo of Bojagi](https://user-images.githubusercontent.com/1235818/81745374-06092a00-94a5-11ea-85ad-2e9e91963aec.gif)

You just upload your components with our CLI and we display them! After you open your PR in GitHub you
can easily review all the changes. The review status is then automatically send to GitHub so you
see if you got greenlit without needing to leave GitHub! Start with writing stories (Storybook works out of the box 📦).

[Look a the quickstart guide here!](https://bojagi.io/docs/quickstart.html)

## 🔮 How to use the CLI?

Install it into your project with yarn:

```
yarn add @bojagi/cli
```

or npm:

```
npm install @bojagi/cli
```

After writing your stories you can test if everything works by listing the components:

```
yarn bojagi list
```

After that you can try to deploy to Bojagi:

```
yarn bojagi deploy
```

[Read more on using the CLI here](https://bojagi.io/docs/cli/)

## License

3-Clause BSD License

